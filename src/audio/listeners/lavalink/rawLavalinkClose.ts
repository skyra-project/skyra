import { AudioListener } from '#lib/audio';
import { ApplyOptions } from '@sapphire/decorators';
import { magenta } from 'colorette';

@ApplyOptions<AudioListener.Options>({ emitter: 'audio', event: 'close' })
export class UserAudioListener extends AudioListener {
	private readonly kHeader = magenta('[LAVALINK]');

	public run(code: number, reason: string) {
		if (code >= 4000) {
			this.container.logger.error([`${this.kHeader} Websocket Close\n           Code  : ${code}\n           Reason: ${reason}`]);
		}
	}
}
