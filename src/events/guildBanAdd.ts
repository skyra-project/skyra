import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { Moderation } from '@utils/constants';
import { Guild, User } from 'discord.js';
import { Event } from 'klasa';

export default class extends Event {

	public async run(guild: Guild, user: User) {
		if (!guild.available || !guild.settings.get(GuildSettings.Events.BanAdd)) return;
		await guild.moderation.waitLock();
		await guild.moderation.create({
			user_id: user.id,
			type: Moderation.TypeCodes.Ban
		}).create();
	}

}
