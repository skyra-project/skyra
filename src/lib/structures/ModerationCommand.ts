import { ModerationEntity } from '@lib/database/entities/ModerationEntity';
import { PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { CLIENT_ID } from '@root/config';
import { isNullOrUndefined } from '@sapphire/utilities';
import { ModerationActionsSendOptions } from '@utils/Security/ModerationActions';
import { cast, floatPromise } from '@utils/util';
import { User } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { DbSet } from './DbSet';
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

	public async run(message: KlasaMessage, args: readonly unknown[]) {
		const resolved = this.resolveOverloads(args);

		const preHandled = await this.prehandle(message, resolved);
		const processed = [] as Array<{ log: ModerationEntity; target: User }>;
		const errored = [] as Array<{ error: Error | string; target: User }>;

		const { targets, ...handledRaw } = resolved;
		for (const target of new Set(targets)) {
			try {
				const handled = { ...handledRaw, target, preHandled };
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
		if (message.guild!.settings.get(GuildSettings.Messages.ModerationAutoDelete)) {
			if (message.deletable) floatPromise(this, message.nuke());
		}

		if (message.guild!.settings.get(GuildSettings.Messages.ModerationMessageDisplay)) {
			const output: string[] = [];
			if (processed.length) {
				const logReason = message.guild!.settings.get(GuildSettings.Messages.ModerationReasonDisplay) ? processed[0].log.reason! : null;
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
					message.language.get(langKey, {
						count: cases.length,
						range,
						users: message.language.list(users, message.language.get(LanguageKeys.Globals.And)),
						reason: logReason
					})
				);
			}

			if (errored.length) {
				const users = errored.map(({ error, target }) => `- ${target.tag} → ${typeof error === 'string' ? error : error.message}`);
				output.push(
					message.language.get(
						users.length === 1
							? LanguageKeys.Commands.Moderation.ModerationFailed
							: LanguageKeys.Commands.Moderation.ModerationFailedPlural,
						{
							users: message.language.list(users, message.language.get(LanguageKeys.Globals.And)),
							count: users.length
						}
					)
				);
			}

			// Else send the message as usual.
			return message.sendMessage(output.join('\n'));
		}

		return null;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected prehandle(message: KlasaMessage, context: CommandContext): Promise<T> | T {
		return cast<T>(null);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected posthandle(message: KlasaMessage, context: PostHandledCommandContext<T>): unknown {
		return null;
	}

	protected async checkModeratable(message: KlasaMessage, context: HandledCommandContext<T>) {
		if (context.target.id === message.author.id) {
			throw message.language.get(LanguageKeys.Misc.CommandUserself);
		}

		if (context.target.id === CLIENT_ID) {
			throw message.language.get(LanguageKeys.Misc.CommandToskyra);
		}

		const member = await message.guild!.members.fetch(context.target.id).catch(() => {
			if (this.requiredMember) throw message.language.get(LanguageKeys.Misc.UserNotInGuild);
			return null;
		});

		if (member) {
			const targetHighestRolePosition = member.roles.highest.position;
			if (targetHighestRolePosition >= message.guild!.me!.roles.highest.position)
				throw message.language.get(LanguageKeys.Misc.CommandRoleHigherSkyra);
			if (targetHighestRolePosition >= message.member!.roles.highest.position) throw message.language.get(LanguageKeys.Misc.CommandRoleHigher);
		}

		return member;
	}

	protected async getTargetDM(message: KlasaMessage, target: User): Promise<ModerationActionsSendOptions> {
		return {
			moderator:
				'no-author' in message.flagArgs
					? null
					: Reflect.has(message.flagArgs, 'authored') || message.guild!.settings.get(GuildSettings.Messages.ModeratorNameDisplay)
					? message.author
					: null,
			send: message.guild!.settings.get(GuildSettings.Messages.ModerationDM) && (await DbSet.fetchModerationDirectMessageEnabled(target.id))
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

	protected abstract handle(message: KlasaMessage, context: HandledCommandContext<T>): Promise<ModerationEntity> | ModerationEntity;

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
