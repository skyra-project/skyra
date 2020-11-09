import { DbSet, GuildSettings } from '@lib/database';
import { SkyraGuild } from '@lib/extensions/SkyraGuild';
import { Events } from '@lib/types/Enums';
import { api } from '@utils/Models/Api';
import { GatewayDispatchEvents, GatewayMessageDeleteDispatch } from 'discord-api-types/v6';
import { DiscordAPIError } from 'discord.js';
import { Event, EventStore } from 'klasa';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: GatewayDispatchEvents.MessageDelete, emitter: store.client.ws });
	}

	public async run(guild: SkyraGuild, data: GatewayMessageDeleteDispatch['d']) {
		guild.starboard.delete(data.id);

		// Delete entry from starboard if it exists
		try {
			const { starboards } = await DbSet.connect();
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
				await api(this.client)
					.channels(channel)
					.messages(result.star_message_id)
					.delete({ reason: 'Starboard Management: Message Deleted' })
					.catch((error: DiscordAPIError) => this.client.emit(Events.ApiError, error));
			}
		} catch (error) {
			this.client.emit(Events.Wtf, error);
		}
	}
}
