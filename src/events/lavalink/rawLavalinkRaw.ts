import { Events } from '@lib/types/Enums';
import { LavalinkEvents } from '@lib/types/Events';
import { ApplyOptions } from '@skyra/decorators';
import { isTrackStuckEvent, isWebSocketClosedEvent, LavalinkEvent } from '@utils/LavalinkUtils';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ emitter: 'lavalink', event: LavalinkEvents.Raw })
export default class extends Event {
	public run(payload: LavalinkEvent) {
		if (typeof payload.guildId !== 'string') return;

		const manager = this.client.guilds.cache.get(payload.guildId)?.music;
		if (typeof manager === 'undefined') return;

		if (isTrackStuckEvent(payload)) {
			return this.client.emit(Events.LavalinkStuck, manager, payload);
		}

		if (isWebSocketClosedEvent(payload)) {
			return this.client.emit(Events.LavalinkWebsocketClosed, manager, payload);
		}
	}
}
