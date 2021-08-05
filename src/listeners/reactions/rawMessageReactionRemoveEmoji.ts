import { readSettings } from '#lib/database';
import { api } from '#lib/discord/Api';
import { Events } from '#lib/types/Enums';
import { getStarboard } from '#utils/functions';
import { compareEmoji } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import { GatewayDispatchEvents, GatewayMessageReactionRemoveEmojiDispatch } from 'discord-api-types/v9';
import type { DiscordAPIError } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: GatewayDispatchEvents.MessageReactionRemoveEmoji, emitter: 'ws' })
export class UserListener extends Listener {
	public async run(data: GatewayMessageReactionRemoveEmojiDispatch['d']) {
		if (!data.guild_id) return;

		const guild = this.container.client.guilds.cache.get(data.guild_id);
		if (!guild || !guild.channels.cache.has(data.channel_id)) return;

		const [emoji, channel] = await readSettings(guild, (settings) => [settings.starboardEmoji, settings.starboardChannel]);
		if (!compareEmoji(emoji, data.emoji)) return;

		getStarboard(guild).delete(`${data.channel_id}-${data.message_id}`);

		// Delete entry from starboard if it exists
		try {
			const { starboards } = this.container.db;
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
					.catch((error: DiscordAPIError) => this.container.client.emit(Events.Error, error));
			}
		} catch (error) {
			this.container.logger.fatal(error);
		}
	}
}
