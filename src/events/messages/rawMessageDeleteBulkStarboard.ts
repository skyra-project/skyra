import { DbSet, GuildSettings } from '@lib/database';
import { Events } from '@lib/types/Enums';
import { DiscordEvents } from '@lib/types/Events';
import { api } from '@utils/Models/Api';
import { GatewayMessageDeleteBulkDispatch } from 'discord-api-types/v6';
import { DiscordAPIError, Guild } from 'discord.js';
import { Event, EventStore } from 'klasa';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: DiscordEvents.MessageDeleteBulk, emitter: store.client.ws });
	}

	public async run(guild: Guild, data: GatewayMessageDeleteBulkDispatch['d']): Promise<void> {
		for (const id of data.ids) guild.starboard.delete(id);

		// Delete entries from starboard if it exists
		const { starboards } = await DbSet.connect();
		const results = await starboards
			.createQueryBuilder()
			.delete()
			.where('guild_id = :guild', { guild: data.guild_id })
			.andWhere('message_id IN (:...ids)', { ids: data.ids })
			.returning('*')
			.execute();

		// Get channel
		const channel = await guild.readSettings(GuildSettings.Starboard.Channel);
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
	}
}
