import { DbSet } from '#lib/database';
import { api } from '#lib/discord/Api';
import { Events } from '#lib/types/Enums';
import { compareEmoji } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions } from '@sapphire/framework';
import { GatewayDispatchEvents, GatewayMessageReactionRemoveEmojiDispatch } from 'discord-api-types/v6';
import type { DiscordAPIError } from 'discord.js';

@ApplyOptions<EventOptions>({ event: GatewayDispatchEvents.MessageReactionRemoveEmoji, emitter: 'ws' })
export class UserEvent extends Event {
	public async run(data: GatewayMessageReactionRemoveEmojiDispatch['d']) {
		if (!data.guild_id) return;

		const guild = this.context.client.guilds.cache.get(data.guild_id);
		if (!guild || !guild.channels.cache.has(data.channel_id)) return;

		const [emoji, channel] = await guild.readSettings((settings) => [settings.starboardEmoji, settings.starboardChannel]);
		if (!compareEmoji(emoji, data.emoji)) return;

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

			if (result && result.star_message_id) {
				// Get channel
				if (!channel) return;

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
