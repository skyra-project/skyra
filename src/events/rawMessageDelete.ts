import { WSMessageDelete } from '@lib/types/DiscordAPI';
import { Events } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { api } from '@utils/Models/Api';
import { DiscordAPIError } from 'discord.js';
import { Event, EventStore } from 'klasa';
import { SkyraGuild } from '@lib/extensions/SkyraGuild';

export default class extends Event {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'MESSAGE_DELETE', emitter: store.client.ws });
	}

	public async run(data: WSMessageDelete): Promise<void> {
		const guild = this.client.guilds.get(data.guild_id);
		if (!guild || !guild.channels.has(data.channel_id)) return;

		await this.handleStarboard(guild, data);
	}

	private async handleStarboard(guild: SkyraGuild, data: WSMessageDelete) {
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
