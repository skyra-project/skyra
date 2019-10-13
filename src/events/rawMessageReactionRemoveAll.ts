import { Databases } from '../lib/types/constants/Constants';
import { WSMessageReactionRemoveAll } from '../lib/types/DiscordAPI';
import { Events } from '../lib/types/Enums';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { Event, EventStore } from 'klasa';
import { WriteResult } from 'rethinkdb-ts';
import { StarboardMessageData } from '../lib/structures/StarboardMessage';
import { DiscordAPIError } from 'discord.js';
import { api } from '../lib/util/Models/Api';

export default class extends Event {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'MESSAGE_REACTION_REMOVE_ALL', emitter: store.client.ws });
	}

	public async run(data: WSMessageReactionRemoveAll): Promise<void> {
		const guild = this.client.guilds.get(data.guild_id);
		if (!guild || !guild!.channels.has(data.channel_id)) return;
		guild!.starboard.delete(`${data.channel_id}-${data.message_id}`);

		// Delete entry from starboard if it exists
		try {
			const results = await this.client.providers.default.db
				.table(Databases.Starboard)
				.get(`${data.channel_id}.${data.message_id}`)
				.delete({ returnChanges: true })
				.run() as WriteResult<StarboardMessageData>;

			if (!results.changes || !results.deleted) return;

			const channel = guild!.settings.get(GuildSettings.Starboard.Channel);
			if (!channel) return;

			for (const change of results.changes) {
				const messageID = change.old_val ? change.old_val.starMessageID : null;
				if (messageID) {
					api(this.client).channels(channel).messages(messageID)
						.delete({ reason: 'Starboard Management: Reactions Cleared' })
						.catch((error: DiscordAPIError) => this.client.emit(Events.ApiError, error));
				}
			}
		} catch (error) {
			this.client.emit(Events.Wtf, error);
		}
	}

}
