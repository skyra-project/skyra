import { GuildSettings, readSettings } from '#lib/database';
import { getModeration } from '#utils/functions';
import { TypeMetadata, TypeVariation } from '#utils/moderationConstants';
import { Listener } from '@sapphire/framework';
import type { GuildBan } from 'discord.js';

export class UserListener extends Listener {
	public async run({ guild, user }: GuildBan) {
		if (!guild.available || !(await readSettings(guild, GuildSettings.Events.BanRemove))) return;

		const moderation = getModeration(guild);
		await moderation.waitLock();
		await moderation
			.create({
				userId: user.id,
				moderatorId: process.env.CLIENT_ID,
				type: TypeVariation.Ban,
				metadata: TypeMetadata.Appeal
			})
			.create();
	}
}
