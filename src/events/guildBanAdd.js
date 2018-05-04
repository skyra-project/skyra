const { Event, ModerationLog, Moderation } = require('../index');

module.exports = class extends Event {

	async run(guild, user) {
		if (!guild.available || !guild.configs.events.banAdd) return null;
		return new ModerationLog(guild)
			.setUser(user)
			.setType(Moderation.typeKeys.BAN)
			.send();
	}

};
