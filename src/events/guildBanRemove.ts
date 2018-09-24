const { Event, constants: { MODERATION: { TYPE_KEYS } } } = require('../index');

module.exports = class extends Event {

	public async run(guild, user) {
		if (!guild.available || !guild.settings.events.banRemove) return null;
		return guild.moderation.new
			.setUser(user)
			.setType(TYPE_KEYS.UN_BAN)
			.create();
	}

};
