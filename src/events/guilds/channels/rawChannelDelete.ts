import { DbSet, GuildSettings } from '#lib/database';
import { api } from '#lib/discord/Api';
import { Time } from '#utils/constants';
import { resolveOnErrorCodes } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions } from '@sapphire/framework';
import { DiscordSnowflake } from '@sapphire/snowflake';
import { GatewayChannelDeleteDispatch, GatewayDispatchEvents, RESTJSONErrorCodes } from 'discord-api-types/v6';

@ApplyOptions<EventOptions>({ event: GatewayDispatchEvents.ChannelDelete, emitter: 'ws' })
export class UserEvent extends Event {
	public async run(data: GatewayChannelDeleteDispatch['d']) {
		if (!data.guild_id) return;

		const guild = this.context.client.guilds.cache.get(data.guild_id);
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
			const channel = await guild.readSettings(GuildSettings.Starboard.Channel);
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
				const snowflake = DiscordSnowflake.deconstruct(result);
				const timestamp = Number(snowflake.timestamp);
				if (timestamp >= oldDate) newMessages.push(result);
				else oldMessages.push(result);
			}

			// If there is only one result, delete only one message, otherwise delete in a bulk.
			if (newMessages.length === 1) this.deleteMessage(channel, newMessages[0]);
			else if (newMessages.length >= 2) await this.deleteMessages(channel, newMessages);

			// If there are messages older than 14 days, delete them individually.
			if (oldMessages.length !== 0) await Promise.all(oldMessages.map((message) => this.deleteMessage(channel, message)));
		} catch (error) {
			this.context.client.logger.fatal(error);
		}
	}

	private deleteMessage(channel: string, message: string) {
		return resolveOnErrorCodes(
			api().channels(channel).messages(message).delete({ reason: 'Starboard Management: Message Deleted' }),
			RESTJSONErrorCodes.UnknownMessage
		);
	}

	private deleteMessages(channel: string, messages: readonly string[]) {
		return resolveOnErrorCodes(
			api().channels(channel).messages['bulk-delete'].post({ data: { messages }, reason: 'Starboard Management: Message Deleted' }),
			RESTJSONErrorCodes.UnknownMessage
		);
	}
}
