const { Command } = require('klasa');
const ModerationLog = require('../util/ModerationLog');
const Moderation = require('../util/Moderation');

class ModerationCommand extends Command {

	constructor(client, dir, file, { modType, requiredMember = false, ...options }) {
		super(client, dir, file, options);

		if (!modType) this.client.emit('error', `[COMMAND] ${this} does not have a type.`);

		/**
		 * The type for this command.
		 * @since 3.0.0
		 * @type {string}
		 */
		this.modType = modType;

		/**
		 * Whether a member is required or not.
		 * @since 3.0.0
		 * @type {string}
		 */
		this.requiredMember = requiredMember;
	}

	async checkModeratable(msg, target) {
		const member = this.requiredMember ? await this.fetchTargetMember(msg, target.id) : null;

		if (target === msg.author) throw msg.language.get('COMMAND_USERSELF');
		else if (target === this.client.user) throw msg.language.get('COMMAND_TOSKYRA');
		else if (member) {
			if (member.roles.highest.position >= msg.member.roles.highest.position) throw msg.language.get('COMMAND_ROLE_HIGHER');
		}

		return member;
	}

	fetchTargetMember(msg, id) {
		return msg.guild.members.fetch(id).catch(() => {
			throw msg.language.get('USER_NOT_IN_GUILD');
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

		if (extraData) modlog.setExtraData(extraData);
		return modlog.send();
	}

}

ModerationCommand.types = Moderation.typeKeys;

module.exports = ModerationCommand;
