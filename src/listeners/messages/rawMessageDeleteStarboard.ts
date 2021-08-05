import { GuildSettings, readSettings } from '#lib/database';
import { api } from '#lib/discord/Api';
import { Events } from '#lib/types/Enums';
import { getStarboard } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { GatewayMessageDeleteDispatch } from 'discord-api-types/v9';
import type { DiscordAPIError, Guild } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.RawMessageDelete })
export class UserListener extends Listener {
	public async run(guild: Guild, data: GatewayMessageDeleteDispatch['d']) {
		getStarboard(guild).delete(data.id);

		// Delete entry from starboard if it exists
		try {
			const { starboards } = this.container.db;
			const results = await starboards
				.createQueryBuilder()
				.delete()
				.where('guild_id = :guild', { guild: data.guild_id })
				.andWhere('message_id = :message', { message: data.id })
				.returning('*')
				.execute();

			if (results.affected === 0) return;
			const [result] = results.raw;

			// Get channel
			const channel = await readSettings(guild, GuildSettings.Starboard.Channel);
			if (!channel) return;

			if (result && result.star_message_id) {
				await api()
					.channels(channel)
					.messages(result.star_message_id)
					.delete({ reason: 'Starboard Management: Message Deleted' })
					.catch((error: DiscordAPIError) => this.container.client.emit(Events.Error, error));
			}
		} catch (error) {
			this.container.logger.fatal(error);
		}
	}
}
