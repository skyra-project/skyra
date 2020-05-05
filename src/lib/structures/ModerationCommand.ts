import { PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { UserSettings } from '@lib/types/settings/UserSettings';
import { ModerationActionsSendOptions } from '@utils/Security/ModerationActions';
import { floatPromise } from '@utils/util';
import { User } from 'discord.js';
import { CommandStore, KlasaMessage, util } from 'klasa';
import { ModerationManagerEntry } from './ModerationManagerEntry';
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
		super(store, file, directory, util.mergeDefault<Partial<ModerationCommandOptions>, ModerationCommandOptions>({
			flagSupport: true,
			optionalDuration: false,
			permissionLevel: PermissionLevels.Moderator,
			requiredMember: false,
			runIn: ['text'],
			usage: options.usage ?? options.optionalDuration
				? '<users:...user{,10}> [duration:timespan] [reason:...string]'
				: '<users:...user{,10}> [reason:...string]',
			usageDelim: ' '
		}, options));

		this.requiredMember = options.requiredMember!;
		this.optionalDuration = options.optionalDuration!;
	}

	public async run(message: KlasaMessage, args: readonly unknown[]) {
		const resolved = this.resolveOverloads(args);

		const preHandled = await this.prehandle(message, resolved);
		const processed = [] as Array<{ log: ModerationManagerEntry; target: User }>;
		const errored = [] as Array<{ error: Error; target: User }>;

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
				const logReason = message.guild!.settings.get(GuildSettings.Messages.ModerationReasonDisplay) ? processed[0].log.reason : null;
				const sorted = processed.sort((a, b) => a.log.case! - b.log.case!);
				const cases = sorted.map(({ log }) => log.case as number);
				const users = sorted.map(({ target }) => `\`${target.tag}\``);
				const range = cases.length === 1 ? cases[0] : `${cases[0]}..${cases[cases.length - 1]}`;
				output.push(message.language.tget('COMMAND_MODERATION_OUTPUT', cases, range, users, logReason));
			}

			if (errored.length) {
				const users = errored.map(({ error, target }) => `- ${target.tag} → ${error.stack || error.message}`);
				output.push(message.language.tget('COMMAND_MODERATION_FAILED', users));
			}

			// Else send the message as usual.
			return message.sendMessage(output.join('\n'));
		}

		return null;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected prehandle(message: KlasaMessage, context: CommandContext): Promise<T> | T {
		return null as unknown as T;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected posthandle(message: KlasaMessage, context: PostHandledCommandContext<T>): unknown {
		return null;
	}

	protected async checkModeratable(message: KlasaMessage, context: HandledCommandContext<T>) {
		if (context.target.id === message.author.id) {
			throw message.language.tget('COMMAND_USERSELF');
		}

		if (context.target.id === this.client.user!.id) {
			throw message.language.tget('COMMAND_TOSKYRA');
		}

		const member = await message.guild!.members.fetch(context.target.id).catch(() => {
			if (this.requiredMember) throw message.language.tget('USER_NOT_IN_GUILD');
			return null;
		});

		if (member) {
			const targetHighestRolePosition = member.roles.highest.position;
			if (targetHighestRolePosition >= message.guild!.me!.roles.highest.position) throw message.language.tget('COMMAND_ROLE_HIGHER_SKYRA');
			if (targetHighestRolePosition >= message.member!.roles.highest.position) throw message.language.tget('COMMAND_ROLE_HIGHER');
		}

		return member;
	}

	protected getTargetDM(message: KlasaMessage, target: User): ModerationActionsSendOptions {
		return {
			moderator: 'no-author' in message.flagArgs
				? null
				: (('authored' in message.flagArgs) || message.guild!.settings.get(GuildSettings.Messages.ModeratorNameDisplay))
					? message.author
					: null,
			send: message.guild!.settings.get(GuildSettings.Messages.ModerationDM) && target.settings.get(UserSettings.ModerationDM)
		};
	}

	protected resolveOverloads([targets, ...args]: readonly unknown[]): CommandContext {
		if (this.optionalDuration) {
			return {
				targets: targets as User[],
				duration: args[0] as number | null,
				reason: args[1] as string | null
			};
		}

		return {
			targets: targets as User[],
			duration: null,
			reason: args[0] as string | null
		};
	}

	protected abstract handle(message: KlasaMessage, context: HandledCommandContext<T>): Promise<ModerationManagerEntry> | ModerationManagerEntry;

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
