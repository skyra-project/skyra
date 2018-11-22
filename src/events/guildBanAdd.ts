import { Event, constants: { MODERATION: { TYPE_KEYS } } } from '../index';

export default class extends Event {

	async run(guild, user) {
		if (!guild.available || !guild.settings.events.banAdd) return null;
		await guild.moderation.waitLock();
		return guild.moderation.new
			.setType(TYPE_KEYS.BAN)
			.setUser(user)
			.create();
	}

};
