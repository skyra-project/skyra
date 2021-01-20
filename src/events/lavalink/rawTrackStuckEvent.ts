import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ApplyOptions } from '@sapphire/decorators';
import type { IncomingEventTrackStuckPayload } from '@skyra/audio';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ event: 'TrackStuckEvent' })
export default class extends Event {
	public async run(payload: IncomingEventTrackStuckPayload) {
		// If the threshold is small, send nothing.
		if (payload.thresholdMs < 1000) return;

		// If there is no guild, for some weird reason, skip all other operations.
		const guild = this.context.client.guilds.cache.get(payload.guildId);
		if (!guild) return;

		// Retrieve the queue from the guild.
		const queue = guild.audio;

		// If there is no text channel set-up, skip.
		const channel = await queue.getTextChannel();
		if (!channel) return;

		// Send the message and automatically delete it once the threshold is reached.
		const response = await channel.sendTranslated(LanguageKeys.MusicManager.Stuck, [{ milliseconds: payload.thresholdMs }]);
		await response.nuke(payload.thresholdMs);
	}
}
