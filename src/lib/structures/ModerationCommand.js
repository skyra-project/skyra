const { Command, util: { mergeDefault } } = require('klasa');
const { MODERATION: { TYPE_KEYS } } = require('../util/constants');

class ModerationCommand extends Command {

	constructor(client, store, file, core, { modType, requiredMember = false, ...options }) {
		super(client, store, file, core, mergeDefault({
			runIn: ['text'],
			usage: '<users:...user{1,5}> [reason:...string]',
			usageDelim: ' '
		}, options));

		if (typeof modType === 'undefined') this.client.emit('error', `[COMMAND] ${this} does not have a type.`);

		/**
		 * The type for this command.
		 * @since 3.0.0
		 * @type {number}
		 */
		this.modType = modType;

		/**
		 * Whether a member is required or not.
		 * @since 3.0.0
		 * @type {boolean}
		 */
		this.requiredMember = requiredMember;
	}

	async run(msg, [targets, reason]) {
		if (!reason) reason = null;

		const prehandled = await this.prehandle(msg, targets, reason);
		const promises = [];
		const processed = [], errored = [];
		for (const target of new Set(targets)) {
			promises.push(this.checkModeratable(msg, target)
				.then(member => this.handle(msg, target, member, reason, prehandled))
				.then(log => processed.push({ log, target }))
				.catch(error => errored.push({ error, target })));
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

	// eslint-disable-next-line no-unused-vars
	async prehandle(msg, targets, reason) { return null; }

	// eslint-disable-next-line no-unused-vars
	async handle(msg, target, member, reason, prehandled) { return null; }

	// eslint-disable-next-line no-unused-vars
	async posthandle(msg, targets, reason, prehandled) { return null; }

	async checkModeratable(msg, target) {
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

	sendModlog(msg, target, reason, extraData) {
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

ModerationCommand.types = TYPE_KEYS;

module.exports = ModerationCommand;
