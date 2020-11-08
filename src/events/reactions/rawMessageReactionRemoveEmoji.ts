import { DbSet } from '@lib/database';
import { Events } from '@lib/types/Enums';
import { DiscordEvents } from '@lib/types/Events';
import { api } from '@utils/Models/Api';
import { compareEmoji } from '@utils/util';
import { GatewayMessageReactionRemoveEmojiDispatch } from 'discord-api-types/v6';
import { DiscordAPIError } from 'discord.js';
import { Event, EventStore } from 'klasa';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: DiscordEvents.MessageReactionRemoveEmoji, emitter: store.client.ws });
	}

	public async run(data: GatewayMessageReactionRemoveEmojiDispatch['d']) {
		if (!data.guild_id) return;

		const guild = this.client.guilds.cache.get(data.guild_id);
		if (!guild || !guild.channels.cache.has(data.channel_id)) return;

		const [emoji, channel] = await guild.readSettings((settings) => [settings.starboardEmoji, settings.starboardChannel]);
		if (!compareEmoji(emoji, data.emoji)) return;

		guild.starboard.delete(`${data.channel_id}-${data.message_id}`);

		// Delete entry from starboard if it exists
		try {
			const { starboards } = await DbSet.connect();
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

				await api(this.client)
					.channels(channel)
					.messages(result.star_message_id)
					.delete({ reason: 'Starboard Management: Reactions Cleared' })
					.catch((error: DiscordAPIError) => this.client.emit(Events.ApiError, error));
			}
		} catch (error) {
			this.client.emit(Events.Wtf, error);
		}
	}
}
