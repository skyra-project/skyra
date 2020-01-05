import { Events } from '@lib/types/Enums';
import { isDestroy, isPlayerUpdate, isTrackEndEvent, isTrackExceptionEvent, isTrackStuckEvent, isWebSocketClosedEvent, LavalinkEvent } from '@utils/LavalinkUtils';
import { Colors, Event, EventStore } from 'klasa';

export default class extends Event {

	private kHeader = new Colors({ text: 'magenta' }).format('[LAVALINK]');

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, {
			emitter: store.client.lavalink!,
			event: 'event'
		});
	}

	public run(payload: LavalinkEvent) {
		if (typeof payload.guildId !== 'string') return;

		const manager = this.client.guilds.get(payload.guildId)?.music || null;

		if (isTrackEndEvent(payload)) {
			return this.client.emit(Events.LavalinkEnd, manager, payload);
		}

		if (isTrackExceptionEvent(payload)) {
			return this.client.emit(Events.LavalinkException, manager, payload);
		}

		if (isTrackStuckEvent(payload)) {
			return this.client.emit(Events.LavalinkStuck, manager, payload);
		}

		if (isWebSocketClosedEvent(payload)) {
			return this.client.emit(Events.LavalinkWebsocketClosed, manager, payload);
		}

		if (isPlayerUpdate(payload)) {
			return this.client.emit(Events.LavalinkPlayerUpdate, manager, payload);
		}

		if (isDestroy(payload)) {
			return this.client.emit(Events.LavalinkDestroy, manager, payload);
		}

		this.client.emit(Events.Wtf, `${this.kHeader} OP code not recognized: ${payload.op}`);
		this.client.emit(Events.Error, `           Payload: ${JSON.stringify(payload)}`);
	}

}
