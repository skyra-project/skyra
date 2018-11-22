import { Task, Permissions: { FLAGS }, constants: { MODERATION: { TYPE_KEYS, SCHEMA_KEYS } } } from '../index';

export default class extends Task {

	async run(doc) {
		// Get the guild and check for permissions
		const guild = this.client.guilds.get(doc[SCHEMA_KEYS.GUILD]);
		if (!guild || !guild.me.permissions.has(FLAGS.BAN_MEMBERS)) return;

		// Fetch the user to unban
		const userID = doc[SCHEMA_KEYS.USER];
		const reason = `Ban released after ${this.client.languages.default.duration(doc[SCHEMA_KEYS.DURATION])}`;

		// Unban the user and send the modlog
		const banLog = await this._fetchBanLog(guild, userID);
		if (banLog) await guild.members.unban(userID, `[AUTO] ${reason}`);
		await guild.moderation.new
			.setModerator(this.client.user.id)
			.setUser(userID)
			.setType(TYPE_KEYS.UN_BAN)
			.setReason(banLog && banLog.reason ? `${reason}\nReason for ban: ${banLog.reason}` : reason)
			.create();
	}

	async _fetchBanLog(guild, userID) {
		const users = await guild.fetchBans();
		return users.get(userID) || null;
	}

};
