import { Command, CommandOptions, CommandStore, util } from 'klasa';
import Skyra from '../Skyra';
import { SkyraGuildMember } from '../types/discord.js';
import { SkyraMessage, SkyraUser } from '../types/klasa';
import { ModerationTypes } from '../types/skyra';
import { ConstantsModerationTypeKeys, MODERATION } from '../util/constants';
import ModerationManagerEntry from './ModerationManagerEntry';
const { mergeDefault } = util;
const { TYPE_KEYS } = MODERATION;

type ModerationCommandOptions = {
	modType: ModerationTypes;
	requiredMember?: boolean;
} & CommandOptions;

export default abstract class ModerationCommand extends Command {

	public constructor(client: Skyra, store: CommandStore, file: Array<string>, directory: string, options: ModerationCommandOptions) {
		super(client, store, file, directory, mergeDefault({
			requiredMember: false,
			runIn: ['text'],
			usage: '<users:...user{,10}> [reason:...string]',
			usageDelim: ' '
		}, options));

		this.modType = options.modType;
		// @ts-ignore
		this.requiredMember = options.requiredMember;
	}

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

	public async checkModeratable(msg: SkyraMessage, target: SkyraUser): Promise<SkyraGuildMember | null> {
		if (target.id === msg.author.id)
			throw msg.language.get('COMMAND_USERSELF');

		if (target.id === this.client.user.id)
			throw msg.language.get('COMMAND_TOSKYRA');

		const member: SkyraGuildMember | null = await msg.guild.members.fetch(target.id).catch(() => {
			if (this.requiredMember) throw msg.language.get('USER_NOT_IN_GUILD');
			return null;
		});
		if (member) {
			const targetHighestRolePosition: number = member.roles.highest.position;
			if (targetHighestRolePosition >= msg.guild.me.roles.highest.position) throw msg.language.get('COMMAND_ROLE_HIGHER_SKYRA');
			if (targetHighestRolePosition >= msg.member.roles.highest.position) throw msg.language.get('COMMAND_ROLE_HIGHER');
		}

		return member;
	}

	public abstract async handle(msg: SkyraMessage, target: SkyraUser, member: SkyraGuildMember | null, reason: string | null, prehandled: any): Promise<ModerationManagerEntry>;

	public abstract async posthandle(msg: SkyraMessage, targets: Array<SkyraUser>, reason: string | null, prehandled: any): Promise<any>;

	public abstract async prehandle(msg: SkyraMessage, targets: Array<SkyraUser>, reason: string | null): Promise<any>;

	public async run(msg: SkyraMessage, [targets, reason]: [Array<SkyraUser>, string | null]): Promise<SkyraMessage | Array<SkyraMessage>> {
		if (!reason) reason = null;

		type ModerationCommandProcessed = { log: ModerationManagerEntry; target: SkyraUser };
		type ModerationCommandErrored = { error: Error; target: SkyraUser };

		const prehandled: any = await this.prehandle(msg, targets, reason);
		const promises: Array<Promise<any>> = [];
		const processed: Array<ModerationCommandProcessed> = [];
		const errored: Array < ModerationCommandErrored > = [];
		for (const target of new Set(targets)) {
			promises.push(this.checkModeratable(msg, target)
				.then((member) => this.handle(msg, target, member, reason, prehandled))
				.then((log) => processed.push({ log, target }))
				.catch((error) => errored.push({ error, target })));
		}

		await Promise.all(promises);
		const output: Array<string> = [];
		if (processed.length) {
			const sorted: Array<ModerationCommandProcessed> = processed.sort(
				(a: ModerationCommandProcessed, b: ModerationCommandProcessed) => <number> a.log.case - <number> b.log.case);
			const cases: Array<number> = sorted.map(({ log }) => <number> log.case);
			const users: Array<string> = sorted.map(({ target }) => `\`${target.tag}\``);
			const range: string = cases.length === 1 ? cases[0].toString() : `${cases[0]}..${cases[cases.length - 1]}`;
			output.push(msg.language.get('COMMAND_MODERATION_OUTPUT', cases, range, users, reason));
		}

		if (errored.length) {
			const users: Array<string> = errored.map(({ error, target }) => `- ${target.tag} → ${error}`);
			output.push(msg.language.get('COMMAND_MODERATION_FAILED', users));
		}

		try {
			await this.posthandle(msg, targets, reason, prehandled);
		} catch (_) {
			// noop
		}

		return msg.sendMessage(output.join('\n'));
	}

	public sendModlog(msg: SkyraMessage, target: SkyraUser, reason: string | null, extraData: any): Promise<ModerationManagerEntry | null> {
		if (Array.isArray(reason)) reason = reason.join(' ');
		const modlog: ModerationManagerEntry = msg.guild.moderation.new
			.setModerator(msg.author.id)
			.setUser(target.id)
			.setType(this.modType)
			.setReason(reason);

		if (extraData) modlog.setExtraData(extraData);
		return modlog.create();
	}

	public static types: ConstantsModerationTypeKeys = TYPE_KEYS;

}

export default ModerationCommand;
