import { LavalinkEvent as RawLLEvent } from 'lavacord';

export interface LavalinkEvent extends RawLLEvent {
	op: string;
	guildId: string;
}

export interface LavalinkExceptionEvent extends LavalinkEvent {
	op: 'TrackExceptionEvent';
	track: string;
	error: string;
}

export interface LavalinkStuckEvent extends LavalinkEvent {
	op: 'TrackStuckEvent';
	track: string;
	thresholdMs: number;
}

export interface LavalinkWebSocketClosedEvent extends LavalinkEvent {
	op: 'WebSocketClosedEvent';
	code: number;
	byRemote: boolean;
}

export interface LavalinkPlayerUpdateEvent extends LavalinkEvent {
	op: 'playerUpdate';
	type: never;
	state: {
		time: number;
		position: number;
	};
}

export interface LavalinkCloseEvent extends LavalinkEvent {
	type: never;
}

/**
 * Check if it's a stuck event
 * @param x The event to check
 */
export function isTrackStuckEvent(x: LavalinkEvent): x is LavalinkStuckEvent {
	return x.type === 'TrackStuckEvent';
}

/**
 * Check if it's a ws closed event
 * @param x The event to check
 */
export function isWebSocketClosedEvent(x: LavalinkEvent): x is LavalinkWebSocketClosedEvent {
	return x.type === 'WebSocketClosedEvent';
}
