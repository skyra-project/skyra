import { ApplyOptions } from '@skyra/decorators';
import { Colors, Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ emitter: 'lavalink', event: 'ready' })
export default class extends Event {

	private magenta = new Colors({ text: 'magenta' });

	public run() {
		this.client.console.verbose(`${this.magenta.format('[LAVALINK]')} Connected.`);
	}

}
