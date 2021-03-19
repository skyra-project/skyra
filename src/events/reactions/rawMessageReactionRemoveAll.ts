import { DbSet, GuildSettings } from '#lib/database';
import { api } from '#lib/discord/Api';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions } from '@sapphire/framework';
import { GatewayDispatchEvents, GatewayMessageReactionRemoveAllDispatch } from 'discord-api-types/v6';
import type { DiscordAPIError } from 'discord.js';

@ApplyOptions<EventOptions>({ event: GatewayDispatchEvents.MessageReactionRemoveAll, emitter: 'ws' })
export class UserEvent extends Event {
	public async run(data: GatewayMessageReactionRemoveAllDispatch['d']): Promise<void> {
		if (!data.guild_id) return;

		const guild = this.context.client.guilds.cache.get(data.guild_id);
		if (!guild || !guild.channels.cache.has(data.channel_id)) return;

		guild.starboard.delete(`${data.channel_id}-${data.message_id}`);

		// Delete entry from starboard if it exists
		try {
			const { starboards } = this.context.db;
			const results = await starboards
				.createQueryBuilder()
				.delete()
				.where('guild_id = :guild', { guild: data.guild_id })
				.andWhere('message_id = :message', { message: data.message_id })
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
					.delete({ reason: 'Starboard Management: Reactions Cleared' })
					.catch((error: DiscordAPIError) => this.context.client.emit(Events.ApiError, error));
			}
		} catch (error) {
			this.context.client.logger.fatal(error);
		}
	}
}
