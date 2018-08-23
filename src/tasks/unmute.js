const { Task, ModerationLog, Moderation: { schemaKeys, typeKeys }, util: { removeMute }, Permissions: { FLAGS } } = require('../index');

module.exports = class extends Task {

	async run(doc) {
		// Get the guild
		const guild = this.client.guilds.get(doc[schemaKeys.GUILD]);

		if (!guild) return;
		await removeMute(guild, doc[schemaKeys.USER]);

		// And check for permissions
		if (!guild.me.permissions.has(FLAGS.MANAGE_ROLES)) return;

		// Check if the user is still muted
		const lastMutedCase = await this.client.moderation.appealCase(guild, { [schemaKeys.CASE]: doc[schemaKeys.CASE] }).catch(() => null);
		if (!lastMutedCase || lastMutedCase[schemaKeys.APPEAL]) return;

		// Fetch the user, then the member
		const user = await this.client.users.fetch(doc[schemaKeys.USER]);
		const member = await guild.members.fetch(user.id).catch(() => null);

		// If the member is found, update the roles
		if (member) {
			const { position } = guild.me.roles.highest;
			const roles = (lastMutedCase[schemaKeys.EXTRA_DATA] || [])
				.concat(member.roles.filter(role => role.position < position && !role.managed).map(role => role.id));
			await member.edit({ roles }).catch(() => null);
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
