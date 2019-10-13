import { Databases } from '../lib/types/constants/Constants';
import { WSMessageDeleteBulk } from '../lib/types/DiscordAPI';
import { Events } from '../lib/types/Enums';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { EventStore, Event } from 'klasa';
import { DiscordAPIError } from 'discord.js';
import { WriteResult } from 'rethinkdb-ts';
import { StarboardMessageData } from '../lib/structures/StarboardMessage';
import { api } from '../lib/util/Models/Api';

export default class extends Event {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'MESSAGE_DELETE_BULK', emitter: store.client.ws });
	}

	public async run(data: WSMessageDeleteBulk): Promise<void> {
		const guild = this.client.guilds.get(data.guild_id);
		if (!guild || !guild!.channels.has(data.channel_id)) return;
		for (const id of data.ids) guild!.starboard.delete(id);

		// Delete entries from starboard if it exists
		try {
			const results = await this.client.providers.default.db
				.table(Databases.Starboard)
				// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
				// @ts-ignore 2345
				.getAll(...data.ids.map(id => [data.channel_id, id]), { index: 'channel_message' })
				.delete({ returnChanges: true })
				.run() as WriteResult<StarboardMessageData>;

			if (!results.changes || !results.deleted) return;

			const channel = guild!.settings.get(GuildSettings.Starboard.Channel);
			if (!channel) return;

			const messageSnowflakes = results.changes
				.map(change => change.old_val ? change.old_val.starMessageID : null)
				.filter(v => v);

			if (messageSnowflakes.length === 0) return;
			if (messageSnowflakes.length === 1) {
				api(this.client).channels(channel).messages(messageSnowflakes[0]!)
					.delete({ reason: 'Starboard Management: Message Deleted' })
					.catch((error: DiscordAPIError) => this.client.emit(Events.ApiError, error));
				return;
			}
			api(this.client).channels(channel).messages['bulk-delete']
				.post({ data: { messages: messageSnowflakes }, reason: 'Starboard Management: Message Deleted' })
				.catch((error: DiscordAPIError) => this.client.emit(Events.ApiError, error));
		} catch (error) {
			this.client.emit(Events.Wtf, error);
		}
	}

}
