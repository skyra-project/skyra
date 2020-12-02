import { GuildSettings, ModerationEntity } from '#lib/database';
import { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { CLIENT_ID } from '#root/config';
import { ModerationActionsSendOptions } from '#utils/Security/ModerationActions';
import { cast, floatPromise } from '#utils/util';
import { isNullOrUndefined } from '@sapphire/utilities';
import { User } from 'discord.js';
import { CommandStore, Language } from 'klasa';
import { DbSet } from '../database/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from './SkyraCommand';

export interface ModerationCommandOptions extends SkyraCommandOptions {
	requiredMember?: boolean;
	optionalDuration?: boolean;
}

export abstract class ModerationCommand<T = unknown> extends SkyraCommand {
	/**
	 * Whether a member is required or not.
	 */
	public requiredMember: boolean;

	/**
	 * Whether or not this moderation command can create temporary actions.
	 */
	public optionalDuration: boolean;

	protected constructor(store: CommandStore, file: string[], directory: string, options: ModerationCommandOptions) {
		super(store, file, directory, {
			flagSupport: true,
			optionalDuration: false,
			permissionLevel: PermissionLevels.Moderator,
			requiredMember: false,
			runIn: ['text'],
			usage:
				options.usage ?? options.optionalDuration
					? '<users:...user{,10}> [duration:timespan] [reason:...string]'
					: '<users:...user{,10}> [reason:...string]',
			usageDelim: ' ',
			...options
		});

		this.requiredMember = options.requiredMember!;
		this.optionalDuration = options.optionalDuration!;
	}

	public async run(message: GuildMessage, args: readonly unknown[]) {
		const resolved = this.resolveOverloads(args);

		const preHandled = await this.prehandle(message, resolved);
		const processed = [] as Array<{ log: ModerationEntity; target: User }>;
		const errored = [] as Array<{ error: Error | string; target: User }>;

		const [shouldAutoDelete, shouldDisplayMessage, shouldDisplayReason, language] = await message.guild.readSettings((settings) => [
			settings[GuildSettings.Messages.ModerationAutoDelete],
			settings[GuildSettings.Messages.ModerationMessageDisplay],
			settings[GuildSettings.Messages.ModerationReasonDisplay],
			settings.getLanguage()
		]);

		const { targets, ...handledRaw } = resolved;
		for (const target of new Set(targets)) {
			try {
				const handled = { ...handledRaw, target, preHandled };
				await this.checkModeratable(message, language, handled);
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
			if (message.deletable) floatPromise(this, message.nuke());
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
					? cases.length === 1
						? LanguageKeys.Commands.Moderation.ModerationOutputWithReason
						: LanguageKeys.Commands.Moderation.ModerationOutputWithReasonPlural
					: cases.length === 1
					? LanguageKeys.Commands.Moderation.ModerationOutput
					: LanguageKeys.Commands.Moderation.ModerationOutputPlural;
				output.push(
					language.get(langKey, {
						count: cases.length,
						range,
						users: language.list(users, language.get(LanguageKeys.Globals.And)),
						reason: logReason
					})
				);
			}

			if (errored.length) {
				const users = errored.map(({ error, target }) => `- ${target.tag} → ${typeof error === 'string' ? error : error.message}`);
				output.push(
					language.get(
						users.length === 1
							? LanguageKeys.Commands.Moderation.ModerationFailed
							: LanguageKeys.Commands.Moderation.ModerationFailedPlural,
						{
							users: language.list(users, language.get(LanguageKeys.Globals.And)),
							count: users.length
						}
					)
				);
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

	protected async checkModeratable(message: GuildMessage, language: Language, context: HandledCommandContext<T>) {
		if (context.target.id === message.author.id) {
			throw language.get(LanguageKeys.Misc.CommandUserself);
		}

		if (context.target.id === CLIENT_ID) {
			throw language.get(LanguageKeys.Misc.CommandToskyra);
		}

		const member = await message.guild.members.fetch(context.target.id).catch(() => {
			if (this.requiredMember) throw language.get(LanguageKeys.Misc.UserNotInGuild);
			return null;
		});

		if (member) {
			const targetHighestRolePosition = member.roles.highest.position;
			if (targetHighestRolePosition >= message.guild.me!.roles.highest.position) throw language.get(LanguageKeys.Misc.CommandRoleHigherSkyra);
			if (targetHighestRolePosition >= message.member.roles.highest.position) throw language.get(LanguageKeys.Misc.CommandRoleHigher);
		}

		return member;
	}

	protected async getTargetDM(message: GuildMessage, target: User): Promise<ModerationActionsSendOptions> {
		const [nameDisplay, enabledDM] = await message.guild.readSettings([
			GuildSettings.Messages.ModeratorNameDisplay,
			GuildSettings.Messages.ModerationDM
		]);

		return {
			moderator: Reflect.has(message.flagArgs, 'no-author')
				? null
				: Reflect.has(message.flagArgs, 'authored') || nameDisplay
				? message.author
				: null,
			send: enabledDM && (await DbSet.fetchModerationDirectMessageEnabled(target.id))
		};
	}

	protected resolveOverloads([targets, ...args]: readonly unknown[]): CommandContext {
		if (this.optionalDuration) {
			return {
				targets: targets as User[],
				duration: this.resolveDuration(args[0] as number | null),
				reason: this.resolveReason(args[1] as string | null)
			};
		}

		return {
			targets: targets as User[],
			duration: null,
			reason: this.resolveReason(args[0] as string | null)
		};
	}

	protected abstract handle(message: GuildMessage, context: HandledCommandContext<T>): Promise<ModerationEntity> | ModerationEntity;

	private resolveReason(value: string | null): string | null {
		return !isNullOrUndefined(value) && value.length > 0 ? value : null;
	}

	private resolveDuration(value: number | null): number | null {
		return !isNullOrUndefined(value) && value > 0 ? value : null;
	}
}

export interface CommandContext {
	targets: User[];
	duration: number | null;
	reason: string | null;
}

export interface HandledCommandContext<T = unknown> extends Pick<CommandContext, 'duration' | 'reason'> {
	target: User;
	preHandled: T;
}

export interface PostHandledCommandContext<T = unknown> extends CommandContext {
	preHandled: T;
}
