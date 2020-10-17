import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { IncomingEventTrackStuckPayload } from '@skyra/audio';
import { ApplyOptions } from '@skyra/decorators';
import { TextChannel } from 'discord.js';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ event: 'TrackStuckEvent' })
export default class extends Event {
	public async run(payload: IncomingEventTrackStuckPayload) {
		// If the threshold is small, send nothing.
		if (payload.thresholdMs < 1000) return;

		// If there is no guild, for some weird reason, skip all other operations.
		const guild = this.client.guilds.cache.get(payload.guildId);
		if (!guild) return;

		// Retrieve the queue from the guild.
		const queue = guild.audio;

		// If there is no text channel set-up, skip.
		const channelID = await queue.textChannelID();
		if (!channelID) return;

		// If a channel ID was set but none was found, set as null and skip.
		const channel = guild.channels.cache.get(channelID) as TextChannel | undefined;
		if (!channel) {
			await queue.textChannelID(null);
			return;
		}

		// Send the message and automatically delete it once the threshold is reached.
		const response = await channel.sendLocale(LanguageKeys.MusicManager.Stuck, [{ milliseconds: payload.thresholdMs }]);
		await response.nuke(payload.thresholdMs);
	}
}
