import { AudioListener } from '#lib/audio';
import { ApplyOptions } from '@sapphire/decorators';
import { magenta } from 'colorette';

@ApplyOptions<AudioListener.Options>({ emitter: 'audio', event: 'open' })
export class UserAudioListener extends AudioListener {
	private readonly kHeader = magenta('[LAVALINK]');

	public run() {
		this.container.logger.trace(`${this.kHeader} Connected.`);
	}
}
