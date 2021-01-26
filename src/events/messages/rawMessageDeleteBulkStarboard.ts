import { DbSet, GuildSettings } from '#lib/database';
import { api } from '#lib/discord/Api';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions } from '@sapphire/framework';
import type { GatewayMessageDeleteBulkDispatch } from 'discord-api-types/v6';
import type { DiscordAPIError, Guild } from 'discord.js';

@ApplyOptions<EventOptions>({ event: Events.RawMessageDeleteBulk })
export default class extends Event {
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
			await api()
				.channels(channel)
				.messages(filteredResults[0])
				.delete({ reason: 'Starboard Management: Message Deleted' })
				.catch((error: DiscordAPIError) => this.context.client.emit(Events.ApiError, error));
			return;
		}

		await api()
			.channels(channel)
			.messages['bulk-delete'].post({ data: { messages: filteredResults }, reason: 'Starboard Management: Message Deleted' })
			.catch((error: DiscordAPIError) => this.context.client.emit(Events.ApiError, error));
	}
}
