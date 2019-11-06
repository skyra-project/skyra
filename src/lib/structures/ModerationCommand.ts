import { User } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { ModerationManagerEntry } from './ModerationManagerEntry';
import { SkyraCommand, SkyraCommandOptions } from './SkyraCommand';
import { GuildSettings } from '../types/settings/GuildSettings';
import { UserSettings } from '../types/settings/UserSettings';
import { mergeDefault } from '@klasa/utils';
import { ModerationActionsSendOptions } from '../util/Security/ModerationActions';
import { PermissionLevels } from '../types/Enums';
import { floatPromise } from '../util/util';

interface ModerationCommandOptions extends SkyraCommandOptions {
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

	public constructor(store: CommandStore, file: string[], directory: string, options: ModerationCommandOptions) {
		super(store, file, directory, mergeDefault<Partial<ModerationCommandOptions>, ModerationCommandOptions>({
			flagSupport: true,
			optionalDuration: false,
			permissionLevel: PermissionLevels.Moderator,
			requiredMember: false,
			runIn: ['text'],
			usage: options.optionalDuration
				? '<users:...user{,10}> [duration:timespan] [reason:...string]'
				: '<users:...user{,10}> [reason:...string]',
			usageDelim: ' '
		}, options));

		this.requiredMember = options.requiredMember!;
		this.optionalDuration = options.optionalDuration!;
	}

	public async run(message: KlasaMessage, args: [User[], number | null, string | null] | [User[], string | null]) {
		const [targets, duration, reason] = this.resolveOverloads(args);

		const prehandled = await this.prehandle(message, targets, reason);
		const processed = [] as Array<{ log: ModerationManagerEntry; target: User }>;
		const errored = [] as Array<{ error: Error; target: User }>;

		for (const target of new Set(targets)) {
			try {
				await this.checkModeratable(message, target, prehandled);
				const log = await this.handle(message, target, reason, duration, prehandled);
				processed.push({ log, target });
			} catch (error) {
				errored.push({ error, target });
			}
		}

		try {
			await this.posthandle(message, targets, reason, prehandled);
		} catch {
			// noop
		}

		// If the server was configured to automatically delete messages, delete the command and return null.
		if (message.guild!.settings.get(GuildSettings.Messages.ModerationAutoDelete)) {
			if (message.deletable) floatPromise(this, message.nuke());
			return null;
		}

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
			const users = errored.map(({ error, target }) => `- ${target.tag} → ${error}`);
			output.push(message.language.tget('COMMAND_MODERATION_FAILED', users));
		}

		// Else send the message as usual.
		return message.sendMessage(output.join('\n'));
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async checkModeratable(message: KlasaMessage, target: User, _prehandled: T) {
		if (target.id === message.author.id) {
			throw message.language.tget('COMMAND_USERSELF');
		}

		if (target.id === this.client.user!.id) {
			throw message.language.tget('COMMAND_TOSKYRA');
		}

		const member = await message.guild!.members.fetch(target.id).catch(() => {
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

	private resolveOverloads(args: [User[], number | null, string | null] | [User[], string | null]): [User[], number | null, string | null] {
		if (this.optionalDuration) {
			const typed = args as [User[], number | null, string | null];
			return [typed[0], typed[1] || null, typed[2] || null];
		}

		const typed = args as [User[], string | null];
		return [typed[0], null, typed[1] || null];
	}

	public abstract prehandle(message: KlasaMessage, targets: User[], reason: string | null): Promise<T> | T;

	public abstract handle(message: KlasaMessage, target: User, reason: string | null, duration: number | null, prehandled: T): Promise<ModerationManagerEntry> | ModerationManagerEntry;

	public abstract posthandle(message: KlasaMessage, targets: User[], reason: string | null, prehandled: T): unknown;

}
