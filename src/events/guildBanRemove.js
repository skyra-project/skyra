const { Event, constants: { MODERATION: { TYPE_KEYS } } } = require('../index');

module.exports = class extends Event {

	async run(guild, user) {
		if (!guild.available || !guild.settings.events.banRemove) return null;
		await guild.moderation.waitLock();
		return guild.moderation.new
			.setType(TYPE_KEYS.UN_BAN)
			.setUser(user)
			.create();
	}

};
