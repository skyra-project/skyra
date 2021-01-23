import { AudioEvent } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import { magenta } from 'colorette';

@ApplyOptions<AudioEvent.Options>({ emitter: 'audio', event: 'error' })
export default class extends AudioEvent {
	private readonly kHeader = magenta('[LAVALINK]');

	public run(error: Error) {
		this.context.client.logger.error(`${this.kHeader} ${error.stack}`);
	}
}
