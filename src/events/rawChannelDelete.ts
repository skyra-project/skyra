import { Snowflake } from '@klasa/snowflake';
import { DbSet } from '@lib/structures/DbSet';
import { Events } from '@lib/types/Enums';
import { DiscordEvents } from '@lib/types/Events';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { Time } from '@utils/constants';
import { api } from '@utils/Models/Api';
import { resolveOnErrorCodes } from '@utils/util';
import { GatewayChannelDeleteDispatch, RESTJSONErrorCodes } from 'discord-api-types/v6';
import { Event, EventStore } from 'klasa';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: DiscordEvents.ChannelDelete, emitter: store.client.ws });
	}

	public async run(data: GatewayChannelDeleteDispatch['d']) {
		if (!data.guild_id) return;

		const guild = this.client.guilds.cache.get(data.guild_id);
		if (!guild || !guild.channels.cache.has(data.id)) return;
		for (const [key, value] of guild.starboard.entries()) {
			if (data.id === value.channelID) guild.starboard.delete(key);
		}

		// Delete entries from starboard if it exists
		try {
			const { starboards } = await DbSet.connect();
			const results = await starboards
				.createQueryBuilder()
				.delete()
				.where('guild_id = :guild', { guild: data.guild_id })
				.andWhere('channel_id = :channel', { channel: data.id })
				.returning('*')
				.execute();

			// Get channel
			const channel = guild.settings.get(GuildSettings.Starboard.Channel);
			if (!channel) return;

			const filteredResults: string[] = [];
			for (const result of results.raw) if (result.star_message_id) filteredResults.push(result.star_message_id);

			// If there is none or one result, do nothing or delete one.
			if (filteredResults.length === 0) return;
			if (filteredResults.length === 1) return await this.deleteMessage(channel, filteredResults[0]);

			// Filter messages, bulk-messages only work for messages that are younger than 14 days.
			const oldMessages: string[] = [];
			const newMessages: string[] = [];
			const oldDate = Date.now() - Time.Day * 14;
			for (const result of filteredResults) {
				const snowflake = new Snowflake(result);
				if (snowflake.timestamp >= oldDate) newMessages.push(result);
				else oldMessages.push(result);
			}

			// If there is only one result, delete only one message, otherwise delete in a bulk.
			if (newMessages.length === 1) this.deleteMessage(channel, newMessages[0]);
			else if (newMessages.length >= 2) await this.deleteMessages(channel, newMessages);

			// If there are messages older than 14 days, delete them individually.
			if (oldMessages.length !== 0) await Promise.all(oldMessages.map((message) => this.deleteMessage(channel, message)));
		} catch (error) {
			this.client.emit(Events.Wtf, error);
		}
	}

	private deleteMessage(channel: string, message: string) {
		return resolveOnErrorCodes(
			api(this.client).channels(channel).messages(message).delete({ reason: 'Starboard Management: Message Deleted' }),
			RESTJSONErrorCodes.UnknownMessage
		);
	}

	private deleteMessages(channel: string, messages: readonly string[]) {
		return resolveOnErrorCodes(
			api(this.client).channels(channel).messages['bulk-delete'].post({ data: { messages }, reason: 'Starboard Management: Message Deleted' }),
			RESTJSONErrorCodes.UnknownMessage
		);
	}
}
