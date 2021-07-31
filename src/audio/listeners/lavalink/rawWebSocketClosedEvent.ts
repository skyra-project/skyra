import { AudioListener } from '#lib/audio';
import { ApplyOptions } from '@sapphire/decorators';
import type { IncomingEventWebSocketClosedPayload } from '@skyra/audio';
import { magenta } from 'colorette';
import { VoiceCloseCodes } from 'discord-api-types/voice/v4';

@ApplyOptions<AudioListener.Options>({ event: 'WebSocketClosedEvent' })
export class UserAudioListener extends AudioListener {
	private readonly kHeader = magenta('[LAVALINK]');

	public run(payload: IncomingEventWebSocketClosedPayload) {
		// Ignore normal close codes:
		if (payload.code < 4000) return;

		// Ignore normal disconnection:
		if (payload.code === VoiceCloseCodes.Disconnected) return;

		this.container.logger.error([
			`${this.kHeader} Websocket Close (${payload.guildId})`,
			`           Code  : ${payload.code}`,
			`           Reason: ${payload.reason}`
		]);
	}
}
