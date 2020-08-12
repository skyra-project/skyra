import { Colors } from '@klasa/console';
import { LavalinkEvents } from '@lib/types/Events';
import { ApplyOptions } from '@skyra/decorators';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ emitter: 'lavalink', event: LavalinkEvents.Ready })
export default class extends Event {
	private magenta = new Colors({ text: 'magenta' });

	public run() {
		this.client.console.verbose(`${this.magenta.format('[LAVALINK]')} Connected.`);
	}
}
