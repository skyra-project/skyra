import { Events } from '@lib/types/Enums';
import { IncomingEventWebSocketClosedPayload } from '@skyra/audio';
import { ApplyOptions } from '@skyra/decorators';
import { magenta } from 'colorette';
import { VoiceCloseCodes } from 'discord-api-types/v6';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ event: 'WebSocketClosedEvent' })
export default class extends Event {
	private readonly kHeader = magenta('[LAVALINK]');

	public run(payload: IncomingEventWebSocketClosedPayload) {
		// Ignore normal close codes:
		if (payload.code < 4000) return;

		// Ignore normal disconnection:
		if (payload.code === VoiceCloseCodes.Disconnected) return;

		this.client.emit(Events.Error, [
			`${this.kHeader} Websocket Close (${payload.guildId})`,
			`           Code  : ${payload.code}`,
			`           Reason: ${payload.reason}`
		]);
	}
}
