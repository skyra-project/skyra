const { Command } = require('klasa');
const ModerationLog = require('../util/ModerationLog');
const Moderation = require('../util/Moderation');

class ModerationCommand extends Command {

	constructor(client, store, file, core, { avoidAnonymous = false, modType, requiredMember = false, ...options }) {
		super(client, store, file, core, options);

		if (!modType) this.client.emit('error', `[COMMAND] ${this} does not have a type.`);

		/**
		 * Whether this command should deactivate anonymous logs.
		 * @since 3.0.0
		 * @type {boolean}
		 */
		this.avoidAnonymous = avoidAnonymous;

		/**
		 * The type for this command.
		 * @since 3.0.0
		 * @type {string}
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

		if (target === msg.author) throw msg.language.get('COMMAND_USERSELF');
		else if (target === this.client.user) throw msg.language.get('COMMAND_TOSKYRA');
		else if (member) {
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
		this.client.moderation._temp.set(target.id, this.modType);
		const modlog = new ModerationLog(msg.guild)
			.setModerator(msg.author)
			.setUser(target)
			.setType(this.modType)
			.setReason(reason);

		if (this.avoidAnonymous) modlog.avoidAnonymous();
		if (extraData) modlog.setExtraData(extraData);
		return modlog.send();
	}

}

ModerationCommand.types = Moderation.typeKeys;

module.exports = ModerationCommand;
