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
		if (!guild || !guild.me.permissions.has('BAN_MEMBERS')) return;

		// Fetch the user to unban
		const user = await this.client.users.fetch(doc.user);
		const reason = `Ban released after ${this.timestamp.display(doc.duration)}`;
		user.action = 'unban';

		// Unban the user and send the modlog
		const banLog = await this._fetchBanLog(guild, user);
		if (banLog) await guild.unban(user, `[AUTO] ${reason}`);
		await new ModerationLog(guild)
			.setModerator(this.client.user)
			.setUser(user)
			.setType(Moderation.typeKeys.UN_BAN)
			.setReason(banLog && banLog.reason ? `${reason}\nReason for ban: ${banLog.reason}` : reason)
			.send();
	}

	async _fetchBanLog(guild, user) {
		const users = await guild.fetchBans();
		if (users.size === 0) return null;
		const log = users.get(user.id);
		return log || null;
	}

};
