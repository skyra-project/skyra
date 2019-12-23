export const enum IncomingWebsocketAction {
	Authenticate = 'AUTHENTICATE',
	MusicQueueUpdate = 'MUSIC_QUEUE_UPDATE',
	SubscriptionUpdate = 'SUBSCRIPTION_UPDATE'
}

export const enum OutgoingWebsocketAction {
	Authenticate = 'AUTHENTICATE',
	MusicSync = 'MUSIC_SYNC'
}

export const enum MusicAction {
	SkipSong = 'SKIP_SONG',
	AddSong = 'ADD_SONG',
	DeleteSong = 'DELETE_SONG',
	PauseSong = 'PAUSE_SONG',
	ResumePlaying = 'RESUME_PLAYING'
}

export const enum SubscriptionAction {
	Subscribe = 'SUBSCRIBE',
	Unsubscribe = 'UNSUBSCRIBE'
}

export const enum SubscriptionName {
	Music = 'MUSIC',
	Something = 'SOMETHING'
}

export interface MusicSubscription {
	type: SubscriptionName.Music;
	guild_id: string;
}

export interface ExampleSubscription {
	type: SubscriptionName.Something;
	something: string;
}

export type Subscription = MusicSubscription | ExampleSubscription;

export const enum CloseCodes {
	ProtocolError = 1002,
	PolicyViolation = 1008,
	InternalError = 1011,
	Unauthorized = 4301,
}

export interface IncomingDataObject {
	token?: string;
	user_id?: string;
	music_action?: MusicAction;
	subscription_action?: SubscriptionAction;
	subscription_name?: SubscriptionName;
	guild_id?: string;
}

export interface IncomingWebsocketMessage {
	action: IncomingWebsocketAction;
	data: IncomingDataObject;
}

export interface OutgoingWebsocketMessage {
	action?: OutgoingWebsocketAction;
	data?: unknown;
	error?: string;
	success?: boolean;
}

export interface UserAuthObject {
	user_id: number;
	token: string;
}
