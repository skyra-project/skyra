import { RawEvent } from '../lib/structures/RawEvent';
import { Databases } from '../lib/types/constants/Constants';
import { WSMessageDeleteBulk } from '../lib/types/DiscordAPI';
import { Events } from '../lib/types/Enums';
import { GuildSettings } from '../lib/types/settings/GuildSettings';

export default class extends RawEvent {

	public async run(data: WSMessageDeleteBulk): Promise<void> {
		const guild = this.client.guilds.get(data.guild_id);
		if (!guild || !guild.channels.has(data.channel_id)) return;
		for (const id of data.ids) guild.starboard.delete(id);

		// Delete entries from starboard if it exists
		try {
			// @ts-ignore
			const results = await this.client.providers.default.db
				.table(Databases.Starboard)
				.getAll(...data.ids.map((id) => [data.channel_id, id]), { index: 'channel_message' })
				.delete({ returnChanges: true })
				.run();

			if (!results.deleted) return;

			const channel = guild.settings.get(GuildSettings.Starboard.Channel) as GuildSettings.Starboard.Channel;
			if (!channel) return;

			const messageSnowflakes = results.changes
				.map((change) => change.old_val.starMessageID)
				.filter((v) => v);

			if (messageSnowflakes.length === 0) return;
			if (messageSnowflakes.length === 1) {
				// @ts-ignore
				this.client.api.channels(channel).messages(messageSnowflakes[0])
					.delete({ reason: 'Starboard Management: Message Deleted' })
					.catch((error) => this.client.emit(Events.ApiError, error));
				return;
			}
			// @ts-ignore
			this.client.api.channels[channel].messages['bulk-delete']
				.post({ data: { messages: messageSnowflakes }, reason: 'Starboard Management: Message Deleted' })
				.catch((error) => this.client.emit(Events.ApiError, error));
		} catch (error) {
			this.client.emit(Events.Wtf, error);
		}
	}

}
