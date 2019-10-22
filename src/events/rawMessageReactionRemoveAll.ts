import { DiscordAPIError } from 'discord.js';
import { Event, EventOptions } from 'klasa';
import { WSMessageReactionRemoveAll } from '../lib/types/DiscordAPI';
import { Events } from '../lib/types/Enums';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { api } from '../lib/util/Models/Api';
import { ApplyOptions } from '../lib/util/util';

@ApplyOptions<EventOptions>({
	name: 'MESSAGE_REACTION_REMOVE_ALL',
	emitter: 'ws'
})
export default class extends Event {

	public async run(data: WSMessageReactionRemoveAll): Promise<void> {
		const guild = this.client.guilds.get(data.guild_id);
		if (!guild || !guild.channels.has(data.channel_id)) return;
		guild.starboard.delete(`${data.channel_id}-${data.message_id}`);

		// Delete entry from starboard if it exists
		try {
			const results = await this.client.queries.deleteStarReturning(data.guild_id, data.message_id);

			// Get channel
			const channel = guild.settings.get(GuildSettings.Starboard.Channel);
			if (!channel) return;

			if (results && results.star_message_id) {
				await api(this.client).channels(channel).messages(results.star_message_id)
					.delete({ reason: 'Starboard Management: Reactions Cleared' })
					.catch((error: DiscordAPIError) => this.client.emit(Events.ApiError, error));
			}
		} catch (error) {
			this.client.emit(Events.Wtf, error);
		}
	}

}
