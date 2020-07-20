import { Colors } from '@klasa/console';
import { MusicHandler, MusicHandlerRequestContext } from '@lib/structures/music/MusicHandler';
import { Events } from '@lib/types/Enums';
import { LavalinkExceptionEvent } from '@utils/LavalinkUtils';
import { Event } from 'klasa';

export default class extends Event {

	private kHeader = new Colors({ text: 'magenta' }).format('[LAVALINK]');

	public async run(manager: MusicHandler, payload: LavalinkExceptionEvent, context: MusicHandlerRequestContext | null = null) {
		// Destroy the instance for this guild
		await manager.handleException(context);

		// Emit an error message if there is an error message to emit
		// The if case is because exceptions are also emitted when Skyra is disconnected by a moderator
		// and disconnect events are not really exceptions (also disconnects are handled by lavalinkWebsocketClosed event)
		if (payload.error) {
			this.client.emit(Events.Error, [
				`${this.kHeader} Exception (${manager.guild.id})`,
				`           Track: ${payload.track}`,
				`           Error: ${payload.error}`
			]);
		}
	}

}
