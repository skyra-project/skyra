import { Events } from '@lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';
import { LavalinkCloseEvent } from '@utils/LavalinkUtils';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ emitter: 'lavalink', event: 'close' })
export default class extends Event {

	public run(payload: LavalinkCloseEvent) {
		const manager = this.client.guilds.get(payload.guildId)?.music;
		if (typeof manager !== 'undefined') this.client.emit(Events.LavalinkClose, manager, payload);
	}

}
