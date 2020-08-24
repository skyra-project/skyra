import { Events } from '@lib/types/Enums';
import { LavalinkEvents } from '@lib/types/Events';
import { ApplyOptions } from '@skyra/decorators';
import { LavalinkEvent, isTrackStuckEvent, isWebSocketClosedEvent } from '@utils/LavalinkUtils';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ emitter: 'lavalink', event: LavalinkEvents.Raw })
export default class extends Event {
	public run(payload: LavalinkEvent) {
		if (typeof payload.guildId !== 'string') return;

		const manager = this.client.guilds.get(payload.guildId)?.music;
		if (typeof manager === 'undefined') return;

		if (isTrackStuckEvent(payload)) {
			return this.client.emit(Events.LavalinkStuck, manager, payload);
		}

		if (isWebSocketClosedEvent(payload)) {
			return this.client.emit(Events.LavalinkWebsocketClosed, manager, payload);
		}
	}
}
