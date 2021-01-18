import { ApplyOptions } from '@sapphire/decorators';
import { magenta } from 'colorette';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ emitter: 'audio', event: 'open' })
export default class extends Event {
	private readonly kHeader = magenta('[LAVALINK]');

	public run() {
		this.client.console.verbose(`${this.kHeader} Connected.`);
	}
}
