import { MusicHandler } from '@lib/structures/music/MusicHandler';
import { Events } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { LavalinkStuckEvent } from '@utils/LavalinkUtils';
import { Event } from 'klasa';

export default class extends Event {
	public async run(manager: MusicHandler, payload: LavalinkStuckEvent) {
		const { channel } = manager;

		if (channel === null || payload.thresholdMs < 1000) return;

		try {
			const response = await channel.sendLocale(LanguageKeys.MusicManager.Stuck, [{ milliseconds: payload.thresholdMs }]);
			await response.nuke(payload.thresholdMs);
		} catch (error) {
			this.client.emit(Events.Wtf, error);
		}
	}
}
