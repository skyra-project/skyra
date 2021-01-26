import { AudioEvent } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import { magenta } from 'colorette';

@ApplyOptions<AudioEvent.Options>({ emitter: 'audio', event: 'open' })
export class UserAudioEvent extends AudioEvent {
	private readonly kHeader = magenta('[LAVALINK]');

	public run() {
		this.context.client.logger.trace(`${this.kHeader} Connected.`);
	}
}
