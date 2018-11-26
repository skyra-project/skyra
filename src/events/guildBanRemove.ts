import { Guild, User } from 'discord.js';
import { Event } from 'klasa';
import { ModerationTypeKeys } from '../lib/util/constants';

export default class extends Event {

	public async run(guild: Guild, user: User): Promise<void> {
		if (!guild.available || !guild.settings.get('events.banRemove')) return;
		await guild.moderation.waitLock();
		await guild.moderation.new
			.setType(ModerationTypeKeys.UnBan)
			.setUser(user)
			.create();
	}

}
