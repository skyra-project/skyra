import { DiscordAPIError } from 'discord.js';
import { Event, EventOptions } from 'klasa';
import { WSMessageDelete } from '../lib/types/DiscordAPI';
import { Events } from '../lib/types/Enums';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { api } from '../lib/util/Models/Api';
import { ApplyOptions } from '../lib/util/util';

@ApplyOptions<EventOptions>({
	name: 'MESSAGE_DELETE',
	emitter: 'ws'
})
export default class extends Event {

	public async run(data: WSMessageDelete): Promise<void> {
		const guild = this.client.guilds.get(data.guild_id);
		if (!guild || !guild.channels.has(data.channel_id)) return;
		guild.starboard.delete(data.id);

		// Delete entry from starboard if it exists
		try {
			const result = await this.client.queries.deleteStarReturning(data.guild_id, data.id);

			// Get channel
			const channel = guild.settings.get(GuildSettings.Starboard.Channel);
			if (!channel) return;

			if (result && result.star_message_id) {
				await api(this.client).channels(channel).messages(result.star_message_id)
					.delete({ reason: 'Starboard Management: Message Deleted' })
					.catch((error: DiscordAPIError) => this.client.emit(Events.ApiError, error));
			}
		} catch (error) {
			this.client.emit(Events.Wtf, error);
		}
	}

}
