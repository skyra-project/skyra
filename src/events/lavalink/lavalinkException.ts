import { Colors } from '@klasa/console';
import { MusicHandler } from '@lib/structures/music/MusicHandler';
import { Events } from '@lib/types/Enums';
import { LavalinkExceptionEvent } from '@utils/LavalinkUtils';
import { Event } from 'klasa';

export default class extends Event {
	private kHeader = new Colors({ text: 'magenta' }).format('[LAVALINK]');

	public run(manager: MusicHandler, payload: LavalinkExceptionEvent) {
		// Emit an error message if there is an error message to emit
		// The if case is because exceptions without error messages are pretty useless
		if (payload.error) {
			this.client.emit(Events.Error, [
				`${this.kHeader} Exception (${manager.guild.id})`,
				`           Track: ${payload.track}`,
				`           Error: ${payload.error}`
			]);
		}
	}
}
