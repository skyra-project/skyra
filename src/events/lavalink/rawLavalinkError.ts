import { ApplyOptions } from '@sapphire/decorators';
import { magenta } from 'colorette';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ emitter: 'audio', event: 'error' })
export default class extends Event {
	private readonly kHeader = magenta('[LAVALINK]');

	public run(error: Error) {
		this.context.client.console.error(`${this.kHeader} ${error.stack}`);
	}
}
