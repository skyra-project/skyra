import { DbSet } from '@lib/structures/DbSet';
import { Events } from '@lib/types/Enums';
import { DiscordEvents } from '@lib/types/Events';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { api } from '@utils/Models/Api';
import { GatewayMessageDeleteBulkDispatch } from 'discord-api-types/v6';
import { DiscordAPIError } from 'discord.js';
import { Event, EventStore } from 'klasa';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: DiscordEvents.MessageDeleteBulk, emitter: store.client.ws });
	}

	public async run(data: GatewayMessageDeleteBulkDispatch['d']): Promise<void> {
		if (!data.guild_id) return;

		const guild = this.client.guilds.cache.get(data.guild_id);
		if (!guild || !guild.channels.cache.has(data.channel_id)) return;

		for (const id of data.ids) guild.starboard.delete(id);

		// Delete entries from starboard if it exists
		try {
			const { starboards } = await DbSet.connect();
			const results = await starboards
				.createQueryBuilder()
				.delete()
				.where('guild_id = :guild', { guild: data.guild_id })
				.andWhere('message_id IN (:...ids)', { ids: data.ids })
				.returning('*')
				.execute();

			// Get channel
			const channel = guild.settings.get(GuildSettings.Starboard.Channel);
			if (!channel) return;

			const filteredResults: string[] = [];
			for (const result of results.raw) if (result.star_message_id) filteredResults.push(result.star_message_id);

			if (filteredResults.length === 0) return;
			if (filteredResults.length === 1) {
				await api(this.client)
					.channels(channel)
					.messages(filteredResults[0])
					.delete({ reason: 'Starboard Management: Message Deleted' })
					.catch((error: DiscordAPIError) => this.client.emit(Events.ApiError, error));
				return;
			}
			await api(this.client)
				.channels(channel)
				.messages['bulk-delete'].post({ data: { messages: filteredResults }, reason: 'Starboard Management: Message Deleted' })
				.catch((error: DiscordAPIError) => this.client.emit(Events.ApiError, error));
		} catch (error) {
			this.client.emit(Events.Wtf, error);
		}
	}
}
