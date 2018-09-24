import { Command, CommandOptions, CommandStore, util } from 'klasa';
import Skyra from '../Skyra';
import { SkyraGuildMember } from '../types/discord.js';
import { SkyraMessage, SkyraUser } from '../types/klasa';
import { ModerationTypes } from '../types/skyra';
import { MODERATION } from '../util/constants';
const { mergeDefault } = util;
const { TYPE_KEYS } = MODERATION;

type ModerationCommandOptions = {
	modType: ModerationTypes;
	requiredMember?: boolean;
} & CommandOptions;

export default abstract class ModerationCommand extends Command {

	public static types = TYPE_KEYS;

	/**
	 * The type for this command.
	 * @since 3.0.0
	 */
	protected modType: ModerationTypes;
	/**
	 * Whether a member is required or not.
	 * @since 3.0.0
	 */
	protected requiredMember: boolean;

	public constructor(client: Skyra, store: CommandStore, file: Array<string>, directory: string, options?: ModerationCommandOptions) {
		super(client, store, file, directory, mergeDefault({
			requiredMember: false,
			runIn: ['text'],
			usage: '<users:...user{,10}> [reason:...string]',
			usageDelim: ' '
		}, options));

		this.modType = options.modType;
		this.requiredMember = options.requiredMember;
	}

	public async checkModeratable(msg: SkyraMessage, target: SkyraUser) {
		if (target.id === msg.author.id)
			throw msg.language.get('COMMAND_USERSELF');

		if (target.id === this.client.user.id)
			throw msg.language.get('COMMAND_TOSKYRA');

		const member = await msg.guild.members.fetch(target.id).catch(() => {
			if (this.requiredMember) throw msg.language.get('USER_NOT_IN_GUILD');
			return null;
		});
		if (member) {
			const targetHighestRolePosition = member.roles.highest.position;
			if (targetHighestRolePosition >= msg.guild.me.roles.highest.position) throw msg.language.get('COMMAND_ROLE_HIGHER_SKYRA');
			if (targetHighestRolePosition >= msg.member.roles.highest.position) throw msg.language.get('COMMAND_ROLE_HIGHER');
		}

		return member;
	}

	// eslint-disable-next-line no-unused-vars
	public abstract async handle(msg: SkyraMessage, target: SkyraUser, member: SkyraGuildMember, reason: string, prehandled: any);

	// eslint-disable-next-line no-unused-vars
	public async posthandle(msg: SkyraMessage, targets: Array<SkyraUser>, reason: string, prehandled: any) { return null; }

	// eslint-disable-next-line no-unused-vars
	public async prehandle(msg: SkyraMessage, targets: Array<SkyraUser>, reason: string) { return null; }

	public async run(msg: SkyraMessage, [targets, reason]: [Array<SkyraUser>, string]) {
		if (!reason) reason = null;

		const prehandled = await this.prehandle(msg, targets, reason);
		const promises = [];
		const processed = [], errored = [];
		for (const target of new Set(targets)) {
			promises.push(this.checkModeratable(msg, target)
				.then((member) => this.handle(msg, target, member, reason, prehandled))
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
			output.push(msg.language.get('COMMAND_MODERATION_OUTPUT', cases, range, users, reason));
		}

		if (errored.length) {
			const users = errored.map(({ error, target }) => `- ${target.tag} → ${error}`);
			output.push(msg.language.get('COMMAND_MODERATION_FAILED', users));
		}

		try {
			await this.posthandle(msg, targets, reason, prehandled);
		} catch (_) {
			// noop
		}

		return msg.sendMessage(output.join('\n'));
	}

	public sendModlog(msg, target, reason, extraData) {
		if (Array.isArray(reason)) reason = reason.join(' ');
		const modlog = msg.guild.moderation.new
			.setModerator(msg.author.id)
			.setUser(target.id)
			.setType(this.modType)
			.setReason(reason);

		if (extraData) modlog.setExtraData(extraData);
		return modlog.create();
	}

}

module.exports = ModerationCommand;
