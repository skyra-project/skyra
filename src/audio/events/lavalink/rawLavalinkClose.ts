import { AudioEvent } from '#lib/audio';
import { ApplyOptions } from '@sapphire/decorators';
import { magenta } from 'colorette';

@ApplyOptions<AudioEvent.Options>({ emitter: 'audio', event: 'close' })
export class UserAudioEvent extends AudioEvent {
	private readonly kHeader = magenta('[LAVALINK]');

	public run(code: number, reason: string) {
		if (code >= 4000) {
			this.context.client.logger.error([`${this.kHeader} Websocket Close\n           Code  : ${code}\n           Reason: ${reason}`]);
		}
	}
}
