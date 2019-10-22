import { DiscordAPIError } from 'discord.js';
import { Event, EventOptions } from 'klasa';
import { WSMessageDeleteBulk } from '../lib/types/DiscordAPI';
import { Events } from '../lib/types/Enums';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { api } from '../lib/util/Models/Api';
import { ApplyOptions } from '../lib/util/util';

@ApplyOptions<EventOptions>({
	name: 'MESSAGE_DELETE_BULK',
	emitter: 'ws'
})
export default class extends Event {

	public async run(data: WSMessageDeleteBulk): Promise<void> {
		const guild = this.client.guilds.get(data.guild_id);
		if (!guild || !guild.channels.has(data.channel_id)) return;
		for (const id of data.ids) guild.starboard.delete(id);


		// Delete entries from starboard if it exists
		try {
			const results = await this.client.queries.deleteStarsReturning(data.guild_id, data.ids);

			// Get channel
			const channel = guild.settings.get(GuildSettings.Starboard.Channel);
			if (!channel) return;

			const filteredResults: string[] = [];
			for (const result of results) if (result.star_message_id) filteredResults.push(result.star_message_id);

			if (filteredResults.length === 0) return;
			if (filteredResults.length === 1) {
				await api(this.client).channels(channel).messages(filteredResults[0])
					.delete({ reason: 'Starboard Management: Message Deleted' })
					.catch((error: DiscordAPIError) => this.client.emit(Events.ApiError, error));
				return;
			}
			await api(this.client).channels(channel).messages['bulk-delete']
				.post({ data: { messages: filteredResults }, reason: 'Starboard Management: Message Deleted' })
				.catch((error: DiscordAPIError) => this.client.emit(Events.ApiError, error));
		} catch (error) {
			this.client.emit(Events.Wtf, error);
		}
	}

}
