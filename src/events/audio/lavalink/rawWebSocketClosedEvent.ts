import { AudioEvent } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import type { IncomingEventWebSocketClosedPayload } from '@skyra/audio';
import { magenta } from 'colorette';
import { VoiceCloseCodes } from 'discord-api-types/v6';

@ApplyOptions<AudioEvent.Options>({ event: 'WebSocketClosedEvent' })
export class UserAudioEvent extends AudioEvent {
	private readonly kHeader = magenta('[LAVALINK]');

	public run(payload: IncomingEventWebSocketClosedPayload) {
		// Ignore normal close codes:
		if (payload.code < 4000) return;

		// Ignore normal disconnection:
		if (payload.code === VoiceCloseCodes.Disconnected) return;

		this.context.client.logger.error([
			`${this.kHeader} Websocket Close (${payload.guildId})`,
			`           Code  : ${payload.code}`,
			`           Reason: ${payload.reason}`
		]);
	}
}
