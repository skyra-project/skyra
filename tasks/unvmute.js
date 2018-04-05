const { Task, ModerationLog, Moderation } = require('../index');

module.exports = class extends Task {

	async run(doc) {
		// Get the guild and check for permissions
		const guild = this.client.guilds.get(doc[Moderation.schemaKeys.GUILD]);
		if (!guild || !guild.me.permissions.has('MUTE_MEMBERS')) return;

		// Fetch the user to unban
		const user = await this.client.users.fetch(doc[Moderation.schemaKeys.USER]);
		const member = await guild.members.fetch(user).catch(() => null);
		const reason = `Mute released after ${this.client.languages.default.duration(doc[Moderation.schemaKeys.DURATION])}`;

		if (member && member.serverMute) await member.setDeaf(false, `[AUTO] ${reason}`);

		// Send the modlog
		await new ModerationLog(guild)
			.setModerator(this.client.user)
			.setUser(user)
			.setType(Moderation.typeKeys.UN_VOICE_MUTE)
			.setReason(member ? reason : `${reason}\n**Skyra**: But the member was away.`)
			.send();
	}

};
