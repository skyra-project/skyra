const { Task, constants: { MODERATION: { SCHEMA_KEYS, TYPE_KEYS } }, util: { removeMute }, Permissions: { FLAGS } } = require('../index');

module.exports = class extends Task {

	public async run(doc) {
		// Get the guild
		const guild = this.client.guilds.get(doc[SCHEMA_KEYS.GUILD]);

		if (!guild) return;
		await removeMute(guild, doc[SCHEMA_KEYS.USER]);

		// And check for permissions
		if (!guild.me.permissions.has(FLAGS.MANAGE_ROLES)) return;

		// Check if the user is still muted
		const modlog = await guild.moderation.fetch(doc[SCHEMA_KEYS.CASE]);
		if (!modlog || modlog.appealed) return;

		await modlog.appeal();

		// Fetch the user, then the member
		const user = await this.client.users.fetch(doc[SCHEMA_KEYS.USER]);
		const member = await guild.members.fetch(user.id).catch(() => null);

		// If the member is found, update the roles
		if (member) {
			const { position } = guild.me.roles.highest;
			const roles = (modlog[SCHEMA_KEYS.EXTRA_DATA] || [])
				.concat(member.roles.filter((role) => role.position < position && !role.managed).map((role) => role.id));
			await member.edit({ roles }).catch(() => null);
		}

		// Send the modlog
		await guild.moderation.new
			.setModerator(this.client.user.id)
			.setUser(user)
			.setType(TYPE_KEYS.UN_MUTE)
			.setReason(`Mute released after ${this.client.languages.default.duration(doc[SCHEMA_KEYS.DURATION])}`)
			.create();
	}

};
