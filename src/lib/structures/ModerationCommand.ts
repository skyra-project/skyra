import { GuildMember, User } from 'discord.js';
import { CommandOptions, CommandStore, KlasaClient, KlasaMessage, util } from 'klasa';
import { ModerationTypeKeys } from '../util/constants';
import { ModerationManagerEntry } from './ModerationManagerEntry';
import { SkyraCommand } from './SkyraCommand';

interface ModerationCommandOptions extends CommandOptions {
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

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string, options: ModerationCommandOptions) {
		super(client, store, file, directory, util.mergeDefault({
			requiredMember: false,
			runIn: ['text'],
			usage: '<users:...user{,10}> [reason:...string]',
			usageDelim: ' '
		}, options));

		if (typeof options.modType === 'undefined') this.client.emit('error', `[COMMAND] ${this} does not have a type.`);
		this.modType = options.modType;
		this.requiredMember = options.requiredMember;
	}

	public async run(message: KlasaMessage, [targets, reason]: [User[], string?]) {
		if (!reason) reason = null;

		const prehandled = await this.prehandle(message, targets, reason);
		const promises = [];
		const processed = [], errored = [];
		for (const target of new Set(targets)) {
			promises.push(this.checkModeratable(message, target)
				.then((member) => this.handle(message, target, member, reason, prehandled))
				.then((log) => processed.push({ log, target }))
				.catch((error) => errored.push({ error, target })));
		}

		await Promise.all(promises);
		const output = [];
		if (processed.length) {
			const sorted = processed.sort((a, b) => a.log.case - b.log.case);
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
		} catch (_) {
			// noop
		}

		return message.sendMessage(output.join('\n')) as Promise<KlasaMessage>;
	}

	// tslint:disable-next-line:no-unused-vars
	public abstract async prehandle(message: KlasaMessage, targets: User[], reason: string): Promise<T>;

	// eslint-disable-next-line no-unused-vars
	public abstract async handle(message: KlasaMessage, target: User, member: GuildMember | null, reason: string, prehandled: T): Promise<unknown>;

	// eslint-disable-next-line no-unused-vars
	public abstract async posthandle(message: KlasaMessage, targets: User[], reason: string, prehandled: T): Promise<unknown>;

	public async checkModeratable(message: KlasaMessage, target: User) {
		if (target.id === message.author.id)
			throw message.language.get('COMMAND_USERSELF');

		if (target.id === this.client.user.id)
			throw message.language.get('COMMAND_TOSKYRA');

		const member = await message.guild.members.fetch(target.id).catch(() => {
			if (this.requiredMember) throw message.language.get('USER_NOT_IN_GUILD');
			return null;
		}) as GuildMember | null;
		if (member) {
			const targetHighestRolePosition = member.roles.highest.position;
			if (targetHighestRolePosition >= message.guild.me.roles.highest.position) throw message.language.get('COMMAND_ROLE_HIGHER_SKYRA');
			if (targetHighestRolePosition >= message.member.roles.highest.position) throw message.language.get('COMMAND_ROLE_HIGHER');
		}

		return member;
	}

	public sendModlog(message: KlasaMessage, target: User, reason: string, extraData?: object): Promise<ModerationManagerEntry> {
		if (Array.isArray(reason)) reason = reason.join(' ');
		const modlog = message.guild.moderation.new
			.setModerator(message.author.id)
			.setUser(target.id)
			.setType(this.modType)
			.setReason(reason);

		if (extraData) modlog.setExtraData(extraData);
		return modlog.create();
	}

}
