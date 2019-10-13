import { Databases } from '../lib/types/constants/Constants';
import { WSMessageDelete } from '../lib/types/DiscordAPI';
import { Events } from '../lib/types/Enums';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { EventStore, Event } from 'klasa';
import { DiscordAPIError } from 'discord.js';
import { api } from '../lib/util/Models/Api';

export default class extends Event {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'MESSAGE_DELETE', emitter: store.client.ws });
	}

	public async run(data: WSMessageDelete): Promise<void> {
		const guild = this.client.guilds.get(data.guild_id);
		if (!guild || !guild!.channels.has(data.channel_id)) return;
		guild!.starboard.delete(data.id);

		// Delete entry from starboard if it exists
		try {
			const results = await this.client.providers.default.db
				.table(Databases.Starboard)
				.get(`${data.guild_id}.${data.id}`)
				.delete({ returnChanges: true })
				.run();

			if (!results.deleted) return;

			const channel = guild!.settings.get(GuildSettings.Starboard.Channel);
			if (!channel) return;

			for (const change of results.changes!) {
				const messageID = change.old_val.starMessageID;
				if (messageID) {
					api(this.client).channels(channel).messages(messageID)
						.delete({ reason: 'Starboard Management: Message Deleted' })
						.catch((error: DiscordAPIError) => this.client.emit(Events.ApiError, error));
				}
			}
		} catch (error) {
			this.client.emit(Events.Wtf, error);
		}
	}

}
