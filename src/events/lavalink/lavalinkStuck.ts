import { Event } from 'klasa';
import { LavalinkStuckEvent } from '@util/LavalinkUtils';
import { MusicHandler } from '@lib/structures/music/MusicHandler';
import { Events } from '@lib/types/Enums';

export default class extends Event {

	public async run(manager: MusicHandler, payload: LavalinkStuckEvent) {
		const { channel } = manager;

		if (channel === null || payload.thresholdMs < 1000) return;

		try {
			const response = await channel.sendLocale('MUSICMANAGER_STUCK', [payload.thresholdMs]);
			await response.nuke(payload.thresholdMs);
		} catch (error) {
			this.client.emit(Events.Wtf, error);
		}

	}

}
