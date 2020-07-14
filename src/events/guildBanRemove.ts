import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { Moderation } from '@utils/constants';
import { Guild, User } from 'discord.js';
import { Event } from 'klasa';

export default class extends Event {

	public async run(guild: Guild, user: User) {
		if (!guild.available || !guild.settings.get(GuildSettings.Events.BanRemove)) return;
		await guild.moderation.waitLock();
		await guild.moderation.create({
			userID: user.id,
			type: Moderation.TypeCodes.UnBan
		}).create();
	}

}
