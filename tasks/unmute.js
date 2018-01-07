const { Task, ModerationLog, Moderation } = require('../index');
const { Timestamp } = require('klasa');

module.exports = class extends Task {

	constructor(...args) {
		super(...args);

		this.timestamp = new Timestamp('hh:mm:ss');
	}

	async run(doc) {
		// Get the guild and check for permissions
		const guild = this.client.guilds.get(doc.guild);
		if (!guild || !guild.me.permissions.has('MANAGE_ROLES')) return;

		// Check if the user is still muted
		const lastMutedCase = await this.client.moderation.getLastCase(guild, { type: 'mute' });
		if (!lastMutedCase || lastMutedCase.appeal) return;

		// Fetch the user, then the member
		const user = await this.client.users.fetch(doc.user);
		const member = await guild.members.fetch(user).catch(() => null);

		// If the member is found, update the roles
		if (member) {
			const roles = Array.isArray(lastMutedCase.extraData) ? lastMutedCase.extraData : null;
			await member.edit({ roles }).catch(() => null);
		}

		// Send the modlog
		await new ModerationLog(guild)
			.setModerator(this.client.user)
			.setUser(user)
			.setType(Moderation.typeKeys.UN_MUTE)
			.setReason(`Mute released after ${this.timestamp.display(doc.duration)}`)
			.send();
	}

};
