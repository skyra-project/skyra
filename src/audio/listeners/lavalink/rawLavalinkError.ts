import { AudioListener } from '#lib/audio';
import { ApplyOptions } from '@sapphire/decorators';
import { magenta } from 'colorette';

@ApplyOptions<AudioListener.Options>({ emitter: 'audio', event: 'error' })
export class UserAudioListener extends AudioListener {
	private readonly kHeader = magenta('[LAVALINK]');

	public run(error: Error) {
		this.container.logger.error(`${this.kHeader} ${error.stack}`);
	}
}
