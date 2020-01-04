import { MusicHandler } from '@lib/structures/music/MusicHandler';
import { Events } from '@lib/types/Enums';
import { LavalinkExceptionEvent } from '@utils/LavalinkUtils';
import { Colors, Event } from 'klasa';

export default class extends Event {

	private kHeader = new Colors({ text: 'magenta' }).format('[LAVALINK]');

	public run(manager: MusicHandler, payload: LavalinkExceptionEvent) {
		this.client.emit(Events.Error, [
			`${this.kHeader} Exception (${manager.guild.id})`,
			`           Track: ${payload.track}`,
			`           Error: ${payload.error}`
		]);
	}

}
