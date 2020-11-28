import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';
import { magenta } from 'colorette';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ emitter: 'audio', event: 'close' })
export default class extends Event {
	private readonly kHeader = magenta('[LAVALINK]');

	public run(code: number, reason: string) {
		if (code >= 4000) {
			this.client.emit(Events.Error, [`${this.kHeader} Websocket Close\n           Code  : ${code}\n           Reason: ${reason}`]);
		}
	}
}
