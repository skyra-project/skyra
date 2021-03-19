import { GuildSettings } from '#lib/database';
import { api } from '#lib/discord/Api';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions } from '@sapphire/framework';
import type { GatewayMessageDeleteDispatch } from 'discord-api-types/v6';
import type { DiscordAPIError, Guild } from 'discord.js';

@ApplyOptions<EventOptions>({ event: Events.RawMessageDelete })
export class UserEvent extends Event {
	public async run(guild: Guild, data: GatewayMessageDeleteDispatch['d']) {
		guild.starboard.delete(data.id);

		// Delete entry from starboard if it exists
		try {
			const { starboards } = this.context.db;
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
			const channel = await guild.readSettings(GuildSettings.Starboard.Channel);
			if (!channel) return;

			if (result && result.star_message_id) {
				await api()
					.channels(channel)
					.messages(result.star_message_id)
					.delete({ reason: 'Starboard Management: Message Deleted' })
					.catch((error: DiscordAPIError) => this.context.client.emit(Events.ApiError, error));
			}
		} catch (error) {
			this.context.client.logger.fatal(error);
		}
	}
}
