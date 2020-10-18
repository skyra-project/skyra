import { Events } from '@lib/types/Enums';
import { IncomingEventWebSocketClosedPayload } from '@skyra/audio';
import { ApplyOptions } from '@skyra/decorators';
import { magenta } from 'colorette';
import { Event, EventOptions } from 'klasa';
import { VoiceCloseCodes } from 'discord-api-types/v6';

@ApplyOptions<EventOptions>({ event: 'WebSocketClosedEvent' })
export default class extends Event {
	private readonly kHeader = magenta('[LAVALINK]');

	public run(payload: IncomingEventWebSocketClosedPayload) {
		if (payload.code === VoiceCloseCodes.Disconnected) return null;

		this.client.emit(Events.Error, [
			`${this.kHeader} Websocket Close (${payload.guildId})`,
			`           Code  : ${payload.code}`,
			`           Reason: ${payload.reason}`
		]);
	}
}
