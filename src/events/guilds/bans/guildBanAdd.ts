import { GuildSettings, readSettings } from '#lib/database';
import { TypeCodes } from '#utils/moderationConstants';
import { Event } from '@sapphire/framework';
import type { Guild, User } from 'discord.js';

export class UserEvent extends Event {
	public async run(guild: Guild, user: User) {
		if (!guild.available || !(await readSettings(guild, GuildSettings.Events.BanAdd))) return;
		await guild.moderation.waitLock();
		await guild.moderation
			.create({
				userID: user.id,
				moderatorID: process.env.CLIENT_ID,
				type: TypeCodes.Ban
			})
			.create();
	}
}
