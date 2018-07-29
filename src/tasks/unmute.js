const { Task, ModerationLog, Moderation: { schemaKeys, typeKeys }, util: { removeMute } } = require('../index');

module.exports = class extends Task {

	async run(doc) {
		// Get the guild and check for permissions
		const guild = this.client.guilds.get(doc[schemaKeys.GUILD]);
		if (!guild || !guild.me.permissions.has('MANAGE_ROLES')) return;

		// Check if the user is still muted
		const lastMutedCase = await this.client.moderation.appealCase(guild, { [schemaKeys.CASE]: doc[schemaKeys.CASE] }).catch(() => null);
		if (!lastMutedCase || lastMutedCase[schemaKeys.APPEAL]) return;

		// Fetch the user, then the member
		const user = await this.client.users.fetch(doc[schemaKeys.USER]);
		const member = await guild.members.fetch(user).catch(() => null);
		await removeMute(guild, user.id);

		// If the member is found, update the roles
		if (member) {
			const roles = (lastMutedCase[schemaKeys.EXTRA_DATA] || []).concat(member.roles.filter(role => role.managed).map(role => role.id));
			if (roles) await member.edit({ roles }).catch(() => null);
		}

		// Send the modlog
		await new ModerationLog(guild)
			.setModerator(this.client.user)
			.setUser(user)
			.setType(typeKeys.UN_MUTE)
			.setReason(`Mute released after ${this.client.languages.default.duration(doc[schemaKeys.DURATION])}`)
			.send();
	}

};
