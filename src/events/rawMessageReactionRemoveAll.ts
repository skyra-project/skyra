import { DbSet } from '@lib/structures/DbSet';
import { WSMessageReactionRemoveAll } from '@lib/types/DiscordAPI';
import { Events } from '@lib/types/Enums';
import { DiscordEvents } from '@lib/types/Events';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { api } from '@utils/Models/Api';
import { DiscordAPIError } from 'discord.js';
import { Event, EventStore } from 'klasa';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: DiscordEvents.MessageReactionRemoveAll, emitter: store.client.ws });
	}

	public async run(data: WSMessageReactionRemoveAll): Promise<void> {
		const guild = this.client.guilds.get(data.guild_id);
		if (!guild || !guild.channels.has(data.channel_id)) return;
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

			// Get channel
			const channel = guild.settings.get(GuildSettings.Starboard.Channel);
			if (!channel) return;

			if (result && result.star_message_id) {
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
