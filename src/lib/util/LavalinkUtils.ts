/**
 * The basic lavalink node
 */
export interface LavalinkEvent {
	op: string;
	type?: string;
	guildId: string;
}

export interface LavalinkStartEvent extends LavalinkEvent {
	track: string;
}

export interface LavalinkEndEvent extends LavalinkEvent {
	track: string;
	reason: string;
}

export interface LavalinkExceptionEvent extends LavalinkEvent {
	track: string;
	error: string;
}

export interface LavalinkStuckEvent extends LavalinkEvent {
	track: string;
	thresholdMs: number;
}

export interface LavalinkWebSocketClosedEvent extends LavalinkEvent {
	code: number;
	reason: string;
	byRemote: boolean;
}

export interface LavalinkPlayerUpdateEvent extends LavalinkEvent {
	type: never;
	state: {
		time: number;
		position: number;
	};
}

export interface LavalinkDestroyEvent extends LavalinkEvent {
	type: never;
}

/**
 * Check if it's an end event
 * @param x The event to check
 */
export function isTrackEndEvent(x: LavalinkEvent): x is LavalinkEndEvent {
	return x.type === 'TrackEndEvent';
}

export function isTrackStartEvent(x: LavalinkEvent): x is LavalinkStartEvent {
	return x.type === 'TrackStartEvent';
}

/**
 * Check if it's an exception event
 * @param x The event to check
 */
export function isTrackExceptionEvent(x: LavalinkEvent): x is LavalinkExceptionEvent {
	return x.type === 'TrackExceptionEvent';
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

/**
 * Check if it's a player update event
 * @param x The event to check
 */
export function isPlayerUpdate(x: LavalinkEvent): x is LavalinkPlayerUpdateEvent {
	return x.op === 'playerUpdate';
}

/**
 * Check if it's a destroy event
 * @param x The event to check
 */
export function isDestroy(x: LavalinkEvent): x is LavalinkDestroyEvent {
	return x.op === 'destroy';
}
