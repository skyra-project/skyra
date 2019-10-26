import { GuildMember, User } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { Events } from '../types/Enums';
import { ModerationTypeKeys, TYPE_ASSETS } from '../util/constants';
import { ModerationManagerEntry } from './ModerationManagerEntry';
import { SkyraCommand, SkyraCommandOptions } from './SkyraCommand';
import { GuildSettings } from '../types/settings/GuildSettings';
import { UserSettings } from '../types/settings/UserSettings';
import { mergeDefault } from '@klasa/utils';

interface ModerationCommandOptions extends SkyraCommandOptions {
	modType: ModerationTypeKeys;
	requiredMember?: boolean;
	optionalDuration?: boolean;
}

export abstract class ModerationCommand<T = unknown> extends SkyraCommand {

	/**
	 * Whether a member is required or not.
	 */
	public requiredMember: boolean;

	/**
	 * The type for this command.
	 */
	public modType: ModerationTypeKeys;

	/**
	 * Whether or not this moderation command can create temporary actions.
	 */
	public optionalDuration: boolean;

	public constructor(store: CommandStore, file: string[], directory: string, options: ModerationCommandOptions) {
		super(store, file, directory, mergeDefault<Partial<ModerationCommandOptions>, ModerationCommandOptions>({
			flagSupport: true,
			optionalDuration: false,
			requiredMember: false,
			runIn: ['text'],
			usage: options.optionalDuration
				? '<users:...user{,10}> [duration:timespan] [reason:...string]'
				: '<users:...user{,10}> [reason:...string]',
			usageDelim: ' '
		}, options));

		if (typeof options.modType === 'undefined') this.client.emit(Events.Error, `[COMMAND] ${this} does not have a type.`);
		this.modType = options.modType;
		this.requiredMember = options.requiredMember!;
		this.optionalDuration = options.optionalDuration!;
	}

	public async run(message: KlasaMessage, args: [User[], number | null, string | null] | [User[], string | null]) {
		const [targets, duration, reason] = this.resolveOverloads(args);

		const prehandled = await this.prehandle(message, targets, reason);
		const processed = [] as Array<{ log: ModerationManagerEntry; target: User }>;
		const errored = [] as Array<{ error: Error; target: User }>;
		const enabledModerationDM = message.guild!.settings.get(GuildSettings.Messages.ModerationDM);
		const { title } = TYPE_ASSETS[this.modType];

		for (const target of new Set(targets)) {
			try {
				const member = await this.checkModeratable(message, target, prehandled);

				// If the guild has opt-in ModerationDM, and the user has not opt-out ModerationDM, proceed to send a moderation log in DMs.
				if (enabledModerationDM && target.settings.get(UserSettings.ModerationDM)) {
					await this.createDM(message, target, title, reason);
				}

				const log = await this.handle(message, target, member, reason, prehandled, duration);
				processed.push({ log, target });
			} catch (error) {
				errored.push({ error, target });
			}
		}

		const output: string[] = [];
		if (processed.length) {
			const logReason = processed[0].log.reason;
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

		try {
			await this.posthandle(message, targets, reason, prehandled);
		} catch {
			// noop
		}

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

	public async sendModlog(message: KlasaMessage, target: User, reason: string | null, extraData?: object | null, duration?: number | null) {
		if (Array.isArray(reason)) reason = reason.join(' ');
		const modlog = message.guild!.moderation.create({
			user_id: target.id,
			moderator_id: message.author.id,
			type: this.modType,
			reason
		});

		if (extraData) modlog.setExtraData(extraData);
		if (duration) modlog.setDuration(duration);
		return (await modlog.create())!;
	}

	protected async createDM(message: KlasaMessage, target: User, title: string, reason: string | null) {
		const named = 'no-author' in message.flagArgs
			? false
			: ('authored' in message.flagArgs) || message.guild!.settings.get(GuildSettings.Messages.ModeratorNameDisplay);

		if (named) await target.sendLocale('COMMAND_MODERATION_DM', [message.guild!.name, title, reason, message.author]);
		else await target.sendLocale('COMMAND_MODERATION_DM_ANONYMOUS', [message.guild!.name, title, reason]);
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

	public abstract handle(message: KlasaMessage, target: User, member: GuildMember | null, reason: string | null, prehandled: T, duration: number | null): Promise<ModerationManagerEntry> | ModerationManagerEntry;

	public abstract posthandle(message: KlasaMessage, targets: User[], reason: string | null, prehandled: T): unknown;

}
