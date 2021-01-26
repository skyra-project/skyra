import { GuildSettings, ModerationEntity } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { CLIENT_ID } from '#root/config';
import type { ModerationActionsSendOptions } from '#utils/Security/ModerationActions';
import { cast, floatPromise } from '#utils/util';
import type { Args, PieceContext } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import type { User } from 'discord.js';
import { DbSet } from '#lib/database/utils/DbSet';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';

export abstract class ModerationCommand<T = unknown> extends SkyraCommand {
	/**
	 * Whether a member is required or not.
	 */
	public requiredMember: boolean;

	/**
	 * Whether or not this moderation command can create temporary actions.
	 */
	public optionalDuration: boolean;

	protected constructor(context: PieceContext, options: ModerationCommand.Options) {
		super(context, {
			strategyOptions: { flags: ['no-author', 'authored'] },
			optionalDuration: false,
			permissionLevel: PermissionLevels.Moderator,
			requiredMember: false,
			runIn: ['text'],
			...options
		});

		this.requiredMember = options.requiredMember!;
		this.optionalDuration = options.optionalDuration!;
	}

	public run(message: GuildMessage, args: ModerationCommand.Args, context: ModerationCommand.Context): Promise<GuildMessage | null>;
	public async run(message: GuildMessage, args: ModerationCommand.Args) {
		const resolved = await this.resolveOverloads(args);
		const preHandled = await this.prehandle(message, resolved);
		const processed = [] as Array<{ log: ModerationEntity; target: User }>;
		const errored = [] as Array<{ error: Error | string; target: User }>;

		const [shouldAutoDelete, shouldDisplayMessage, shouldDisplayReason] = await message.guild.readSettings([
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
				errored.push({ error, target });
			}
		}

		try {
			await this.posthandle(message, { ...resolved, preHandled });
		} catch {
			// noop
		}

		// If the server was configured to automatically delete messages, delete the command and return null.
		if (shouldAutoDelete) {
			if (message.deletable) floatPromise(message.nuke());
		}

		if (shouldDisplayMessage) {
			const output: string[] = [];
			if (processed.length) {
				const logReason = shouldDisplayReason ? processed[0].log.reason! : null;
				const sorted = processed.sort((a, b) => a.log.caseID - b.log.caseID);
				const cases = sorted.map(({ log }) => log.caseID);
				const users = sorted.map(({ target }) => `\`${target.tag}\``);
				const range = cases.length === 1 ? cases[0] : `${cases[0]}..${cases[cases.length - 1]}`;
				const langKey = logReason
					? LanguageKeys.Commands.Moderation.ModerationOutputWithReason
					: LanguageKeys.Commands.Moderation.ModerationOutput;
				output.push(args.t(langKey, { count: cases.length, range, users, reason: logReason }));
			}

			if (errored.length) {
				const users = errored.map(({ error, target }) => `- ${target.tag} → ${typeof error === 'string' ? error : error.message}`);
				output.push(args.t(LanguageKeys.Commands.Moderation.ModerationFailed, { users, count: users.length }));
			}

			// Else send the message as usual.
			return message.send(output.join('\n'));
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

		if (context.target.id === CLIENT_ID) {
			throw context.args.t(LanguageKeys.Commands.Moderation.ToSkyra);
		}

		const member = await message.guild.members.fetch(context.target.id).catch(() => {
			if (this.requiredMember) throw context.args.t(LanguageKeys.Misc.UserNotInGuild);
			return null;
		});

		if (member) {
			const targetHighestRolePosition = member.roles.highest.position;
			if (targetHighestRolePosition >= message.guild.me!.roles.highest.position)
				throw context.args.t(LanguageKeys.Commands.Moderation.RoleHigherSkyra);
			if (targetHighestRolePosition >= message.member.roles.highest.position) throw context.args.t(LanguageKeys.Commands.Moderation.RoleHigher);
		}

		return member;
	}

	protected async getTargetDM(message: GuildMessage, args: Args, target: User): Promise<ModerationActionsSendOptions> {
		const [nameDisplay, enabledDM] = await message.guild.readSettings([
			GuildSettings.Messages.ModeratorNameDisplay,
			GuildSettings.Messages.ModerationDM
		]);

		return {
			moderator: args.getFlags('no-author') ? null : args.getFlags('no-authored') || nameDisplay ? message.author : null,
			send: enabledDM && (await DbSet.fetchModerationDirectMessageEnabled(target.id))
		};
	}

	protected async resolveOverloads(args: ModerationCommand.Args): Promise<CommandContext> {
		return {
			targets: await args.repeat('user', { times: 10 }),
			duration: this.optionalDuration ? await args.pick('timespan', { minimum: 0, maximum: Time.Year * 5 }).catch(() => null) : null,
			reason: args.finished ? null : await args.rest('string')
		};
	}

	protected abstract handle(message: GuildMessage, context: HandledCommandContext<T>): Promise<ModerationEntity> | ModerationEntity;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ModerationCommand {
	/**
	 * The ModerationCommand Options
	 */
	export interface Options extends SkyraCommand.Options {
		requiredMember?: boolean;
		optionalDuration?: boolean;
	}

	export type Args = SkyraCommand.Args;
	export type Context = SkyraCommand.Context;
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
