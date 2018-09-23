const { Command } = require('klasa');
const { MODERATION: { TYPE_KEYS } } = require('../util/constants');

class ModerationCommand extends Command {

	constructor(client, store, file, core, { avoidAnonymous = false, modType, requiredMember = false, ...options }) {
		super(client, store, file, core, options);

		if (typeof modType === 'undefined') this.client.emit('error', `[COMMAND] ${this} does not have a type.`);

		/**
		 * Whether this command should deactivate anonymous logs.
		 * @since 3.0.0
		 * @type {boolean}
		 */
		this.avoidAnonymous = avoidAnonymous;

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

	async checkModeratable(msg, target) {
		const member = await this.fetchTargetMember(msg, target.id, this.requiredMember);

		if (target.id === msg.author.id) {
			throw msg.language.get('COMMAND_USERSELF');
		} else if (target.id === this.client.user.id) {
			throw msg.language.get('COMMAND_TOSKYRA');
		} else if (member) {
			const targetHighestRolePosition = member.roles.highest.position;
			if (targetHighestRolePosition >= msg.guild.me.roles.highest.position) throw msg.language.get('COMMAND_ROLE_HIGHER_SKYRA');
			if (targetHighestRolePosition >= msg.member.roles.highest.position) throw msg.language.get('COMMAND_ROLE_HIGHER');
		}

		return member;
	}

	fetchTargetMember(msg, id, throwError) {
		return msg.guild.members.fetch(id).catch(() => {
			if (throwError) throw msg.language.get('USER_NOT_IN_GUILD');
			return null;
		});
	}

	sendModlog(msg, target, reason, extraData) {
		if (Array.isArray(reason)) reason = reason.join(' ');
		const modlog = msg.guild.moderation.new
			.setModerator(msg.author.id)
			.setUser(target.id)
			.setType(this.modType)
			.setReason(reason);

		if (this.avoidAnonymous) modlog.avoidAnonymous();
		if (extraData) modlog.setExtraData(extraData);
		return modlog.create();
	}

}

ModerationCommand.types = TYPE_KEYS;

module.exports = ModerationCommand;
