const { Event, constants: { MODERATION: { TYPE_KEYS } } } = require('../index');

module.exports = class extends Event {

	async run(guild, user) {
		if (!guild.available || !guild.settings.events.banAdd) return null;
		return guild.moderation.new
			.setType(TYPE_KEYS.BAN)
			.setUser(user)
			.create();
	}

};
