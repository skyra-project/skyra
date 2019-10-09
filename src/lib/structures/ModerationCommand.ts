import { GuildMember, User } from 'discord.js';
import { CommandStore, KlasaMessage, util } from 'klasa';
import { Events } from '../types/Enums';
import { ModerationTypeKeys } from '../util/constants';
import { ModerationManagerEntry } from './ModerationManagerEntry';
import { SkyraCommand, SkyraCommandOptions } from './SkyraCommand';

interface ModerationCommandOptions extends SkyraCommandOptions {
	modType: ModerationTypeKeys;
	requiredMember?: boolean;
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

	public constructor(store: CommandStore, file: string[], directory: string, options: ModerationCommandOptions) {
		super(store, file, directory, util.mergeDefault({
			requiredMember: false,
			runIn: ['text'],
			usage: '<users:...user{,10}> [reason:...string]',
			usageDelim: ' '
		}, options));

		if (typeof options.modType === 'undefined') this.client.emit(Events.Error, `[COMMAND] ${this} does not have a type.`);
		this.modType = options.modType;
		this.requiredMember = options.requiredMember!;
	}

	public async run(message: KlasaMessage, [targets, reason]: [User[], string | null]) {
		if (!reason) reason = null;

		const prehandled = await this.prehandle(message, targets, reason);
		const processed = [] as Array<{ log: ModerationManagerEntry; target: User }>;
		const errored = [] as Array<{ error: Error; target: User }>;
		for (const target of new Set(targets)) {
			try {
				const member = await this.checkModeratable(message, target);
				const log = await this.handle(message, target, member, reason, prehandled);
				processed.push({ log, target });
			} catch (error) {
				errored.push({ error, target });
			}
		}

		const output = [];
		if (processed.length) {
			reason = processed[0].log.reason;
			const sorted = processed.sort((a, b) => a.log.case! - b.log.case!);
			const cases = sorted.map(({ log }) => log.case);
			const users = sorted.map(({ target }) => `\`${target.tag}\``);
			const range = cases.length === 1 ? cases[0] : `${cases[0]}..${cases[cases.length - 1]}`;
			output.push(message.language.get('COMMAND_MODERATION_OUTPUT', cases, range, users, reason));
		}

		if (errored.length) {
			const users = errored.map(({ error, target }) => `- ${target.tag} → ${error}`);
			output.push(message.language.get('COMMAND_MODERATION_FAILED', users));
		}

		try {
			await this.posthandle(message, targets, reason, prehandled);
		} catch {
			// noop
		}

		return message.sendMessage(output.join('\n'));
	}

	public async checkModeratable(message: KlasaMessage, target: User) {
		if (target.id === message.author!.id) {
			throw message.language.get('COMMAND_USERSELF');
		}

		if (target.id === this.client.user!.id) {
			throw message.language.get('COMMAND_TOSKYRA');
		}

		const member = await message.guild!.members.fetch(target.id).catch(() => {
			if (this.requiredMember) throw message.language.get('USER_NOT_IN_GUILD');
			return null;
		}) as GuildMember | null;
		if (member) {
			const targetHighestRolePosition = member.roles.highest.position;
			if (targetHighestRolePosition >= message.guild!.me!.roles.highest.position) throw message.language.get('COMMAND_ROLE_HIGHER_SKYRA');
			if (targetHighestRolePosition >= message.member!.roles.highest.position) throw message.language.get('COMMAND_ROLE_HIGHER');
		}

		return member;
	}

	public async sendModlog(message: KlasaMessage, target: User, reason: string | null, extraData?: object) {
		if (Array.isArray(reason)) reason = reason.join(' ');
		const modlog = message.guild!.moderation.new
			.setModerator(message.author!.id)
			.setUser(target.id)
			.setType(this.modType)
			.setReason(reason);

		if (extraData) modlog.setExtraData(extraData);
		return (await modlog.create())!;
	}

	public abstract prehandle(message: KlasaMessage, targets: User[], reason: string | null): Promise<T> | T;

	public abstract handle(message: KlasaMessage, target: User, member: GuildMember | null, reason: string | null, prehandled: T): Promise<ModerationManagerEntry> | ModerationManagerEntry;

	public abstract posthandle(message: KlasaMessage, targets: User[], reason: string | null, prehandled: T): unknown;

}
