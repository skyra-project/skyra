const { ModerationLog, Moderation } = require('../index');
const { Task, Timestamp } = require('klasa');

module.exports = class extends Task {

	constructor(...args) {
		super(...args);

		this.timestamp = new Timestamp('hh:mm:ss');
	}

	async run(doc) {
		// Get the guild and check for permissions
		const guild = this.client.guilds.get(doc.guild);
		if (!guild || !guild.me.permissions.has('MUTE_MEMBERS')) return;

		// Fetch the user to unban
		const user = await this.client.users.fetch(doc.user);
		const member = await guild.members.fetch(user).catch(() => null);
		const reason = `Mute released after ${this.timestamp.display(doc.duration)}`;

		if (!member)
			if (member.serverMute) await member.setDeaf(false, `[AUTO] ${reason}`);

		// Send the modlog
		await new ModerationLog(guild)
			.setModerator(this.client.user)
			.setUser(user)
			.setType(Moderation.typeKeys.UN_VOICE_MUTE)
			.setReason(member ? reason : `${reason}\n**Skyra**: But the member was away.`)
			.send();
	}

};
