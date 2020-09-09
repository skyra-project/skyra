import { Events } from '@lib/types/Enums';
import { LavalinkEvents } from '@lib/types/Events';
import { ApplyOptions } from '@skyra/decorators';
import { LavalinkCloseEvent } from '@utils/LavalinkUtils';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ emitter: 'lavalink', event: LavalinkEvents.Close })
export default class extends Event {
	public run(payload: LavalinkCloseEvent) {
		const manager = this.client.guilds.cache.get(payload.guildId)?.music;
		if (typeof manager !== 'undefined') this.client.emit(Events.LavalinkClose, manager, payload);
	}
}
