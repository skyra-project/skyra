import { GuildSettings, readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { ModerationAction } from '#lib/moderation/actions/base/ModerationAction';
import type { ModerationManager } from '#lib/moderation/managers/ModerationManager';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import { PermissionLevels, type GuildMessage } from '#lib/types';
import { asc, floatPromise, seconds, years } from '#utils/common';
import { deleteMessage, isGuildOwner } from '#utils/functions';
import { cast, getTag } from '#utils/util';
import { Args, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { free, send } from '@sapphire/plugin-editable-commands';
import type { User } from 'discord.js';

export abstract class ModerationCommand<T = unknown> extends SkyraCommand {
	/**
	 * Whether a member is required or not.
	 */
	public requiredMember: boolean;

	/**
	 * Whether or not this moderation command can create temporary actions.
	 */
	public optionalDuration: boolean;

	protected constructor(context: ModerationCommand.Context, options: ModerationCommand.Options) {
		super(context, {
			cooldownDelay: seconds(5),
			flags: ['no-author', 'authored', 'no-dm', 'dm'],
			optionalDuration: false,
			permissionLevel: PermissionLevels.Moderator,
			requiredMember: false,
			runIn: [CommandOptionsRunTypeEnum.GuildAny],
			...options
		});

		this.requiredMember = options.requiredMember!;
		this.optionalDuration = options.optionalDuration!;
	}

	public override messageRun(
		message: GuildMessage,
		args: ModerationCommand.Args,
		context: ModerationCommand.RunContext
	): Promise<GuildMessage | null>;

	public override async messageRun(message: GuildMessage, args: ModerationCommand.Args) {
		const resolved = await this.resolveOverloads(args);
		const preHandled = await this.prehandle(message, resolved);
		const processed = [] as Array<{ log: ModerationManager.Entry; target: User }>;
		const errored = [] as Array<{ error: Error | string; target: User }>;

		const [shouldAutoDelete, shouldDisplayMessage, shouldDisplayReason] = await readSettings(message.guild, [
			GuildSettings.Messages.ModerationAutoDelete,
			GuildSettings.Messages.ModerationMessageDisplay,
			GuildSettings.Messages.ModerationReasonDisplay
		]);

		const { targets, ...handledRaw } = resolved;
		for (const target of new Set(targets)) {
			try {
				const handled = { ...handledRaw, args, target, preHandled };
				await this.checkModeratable(message, handled);
				const log = await this.handle(message, handled);
				processed.push({ log, target });
			} catch (error) {
				errored.push({ error: error as Error | string, target });
			}
		}

		try {
			await this.posthandle(message, { ...resolved, preHandled });
		} catch {
			// noop
		}

		// If the server was configured to automatically delete messages, delete the command and return null.
		if (shouldAutoDelete) {
			if (message.deletable) floatPromise(deleteMessage(message));
		}

		if (shouldDisplayMessage) {
			const output: string[] = [];
			if (processed.length) {
				const logReason = shouldDisplayReason ? processed[0].log.reason! : null;
				const sorted = processed.sort((a, b) => asc(a.log.id, b.log.id));
				const cases = sorted.map(({ log }) => log.id);
				const users = sorted.map(({ target }) => `\`${getTag(target)}\``);
				const range = cases.length === 1 ? cases[0] : `${cases[0]}..${cases[cases.length - 1]}`;
				const langKey = logReason
					? LanguageKeys.Commands.Moderation.ModerationOutputWithReason
					: LanguageKeys.Commands.Moderation.ModerationOutput;
				output.push(args.t(langKey, { count: cases.length, range, users, reason: logReason }));
			}

			if (errored.length) {
				const users = errored.map(({ error, target }) => `- ${getTag(target)} → ${typeof error === 'string' ? error : error.message}`);
				output.push(args.t(LanguageKeys.Commands.Moderation.ModerationFailed, { users: users.join('\n'), count: users.length }));
			}

			// Else send the message as usual.
			const content = output.join('\n');
			const response = await send(message, content);

			// If the server was configured to automatically delete messages, untrack the editable message so it doesn't
			// get automatically deleted in the event of race-conditions. `send` + `free` is used over
			// `message.channel.send` so it can edit any existing response.
			if (shouldAutoDelete) {
				free(message);
			}

			return response;
		}

		return null;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected prehandle(_message: GuildMessage, _context: CommandContext): Promise<T> | T {
		return cast<T>(null);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected posthandle(_message: GuildMessage, _context: PostHandledCommandContext<T>): unknown {
		return null;
	}

	protected async checkModeratable(message: GuildMessage, context: HandledCommandContext<T>) {
		if (context.target.id === message.author.id) {
			throw context.args.t(LanguageKeys.Commands.Moderation.UserSelf);
		}

		if (context.target.id === process.env.CLIENT_ID) {
			throw context.args.t(LanguageKeys.Commands.Moderation.ToSkyra);
		}

		const member = await message.guild.members.fetch(context.target.id).catch(() => {
			if (this.requiredMember) throw context.args.t(LanguageKeys.Misc.UserNotInGuild);
			return null;
		});

		if (member) {
			const targetHighestRolePosition = member.roles.highest.position;

			// Skyra cannot moderate members with higher role position than her:
			if (targetHighestRolePosition >= message.guild.members.me!.roles.highest.position) {
				throw context.args.t(LanguageKeys.Commands.Moderation.RoleHigherSkyra);
			}

			// A member who isn't a server owner is not allowed to moderate somebody with higher role than them:
			if (!isGuildOwner(message.member) && targetHighestRolePosition >= message.member.roles.highest.position) {
				throw context.args.t(LanguageKeys.Commands.Moderation.RoleHigher);
			}
		}

		return member;
	}

	protected async getActionData<ContextType = never>(
		message: GuildMessage,
		args: Args,
		target: User,
		context?: ContextType
	): Promise<ModerationAction.Data<ContextType>> {
		const [nameDisplay, enabledDM] = await readSettings(message.guild, [
			GuildSettings.Messages.ModeratorNameDisplay,
			GuildSettings.Messages.ModerationDM
		]);

		return {
			moderator: args.getFlags('no-author') ? null : args.getFlags('authored') || nameDisplay ? message.author : null,
			sendDirectMessage:
				// --no-dm disables
				!args.getFlags('no-dm') &&
				// --dm and enabledDM enable
				(args.getFlags('dm') || enabledDM) &&
				// user settings
				(await this.container.db.fetchModerationDirectMessageEnabled(target.id)),
			context
		};
	}

	protected async resolveOverloads(args: ModerationCommand.Args): Promise<CommandContext> {
		return {
			targets: await args.repeat('user', { times: 10 }),
			duration: await this.resolveDurationArgument(args),
			reason: args.finished ? null : await args.rest('string')
		};
	}

	protected abstract handle(message: GuildMessage, context: HandledCommandContext<T>): Promise<ModerationManager.Entry> | ModerationManager.Entry;

	private async resolveDurationArgument(args: ModerationCommand.Args) {
		if (args.finished) return null;
		if (!this.optionalDuration) return null;

		const result = await args.pickResult('timespan', { minimum: 0, maximum: years(5) });
		return result.match({
			ok: (value) => value,
			err: (error) => {
				if (error.identifier === LanguageKeys.Arguments.TimeSpan) return null;
				throw error;
			}
		});
	}
}

export namespace ModerationCommand {
	/**
	 * The ModerationCommand Options
	 */
	export interface Options extends SkyraCommand.Options {
		requiredMember?: boolean;
		optionalDuration?: boolean;
	}

	export type Args = SkyraCommand.Args;
	export type Context = SkyraCommand.LoaderContext;
	export type RunContext = SkyraCommand.RunContext;
}

export interface CommandContext {
	targets: User[];
	duration: number | null;
	reason: string | null;
}

export interface HandledCommandContext<T = unknown> extends Pick<CommandContext, 'duration' | 'reason'> {
	args: ModerationCommand.Args;
	target: User;
	preHandled: T;
}

export interface PostHandledCommandContext<T = unknown> extends CommandContext {
	preHandled: T;
}
