import { NP } from '@lib/audio';
import { Track } from '@skyra/audio';

export const enum WebsocketEvents {
	Message = 'message',
	Connection = 'connection',
	Close = 'close'
}

export const enum IncomingWebsocketAction {
	MusicQueueUpdate = 'MUSIC_QUEUE_UPDATE',
	SubscriptionUpdate = 'SUBSCRIPTION_UPDATE'
}

export const enum OutgoingWebsocketAction {
	MusicConnect = 'MUSIC_CONNECT',
	MusicFinish = 'MUSIC_FINISH',
	MusicLeave = 'MUSIC_LEAVE',
	MusicPrune = 'MUSIC_PRUNE',
	MusicReplayUpdate = 'MUSIC_REPLAY_UPDATE',
	MusicSongPause = 'MUSIC_SONG_PAUSE',
	MusicSongResume = 'MUSIC_SONG_RESUME',
	MusicSongSeekUpdate = 'MUSIC_SONG_SEEK_UPDATE',
	MusicSongVolumeUpdate = 'MUSIC_SONG_VOLUME_UPDATE',
	MusicSync = 'MUSIC_SYNC',
	MusicVoiceChannelJoin = 'MUSIC_VOICE_CHANNEL_JOIN',
	MusicVoiceChannelLeave = 'MUSIC_VOICE_CHANNEL_LEAVE',
	MusicWebsocketDisconnect = 'MUSIC_WEBSOCKET_DISCONNECT'
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

export const enum CloseCodes {
	ProtocolError = 1002,
	PolicyViolation = 1008,
	InternalError = 1011,
	Unauthorized = 4301,
	DuplicatedConnection = 4302
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
	data?: {
		id?: string;
		tracks?: Track[];
		status?: NP | null;
		volume?: number;
		replay?: boolean;
		voiceChannel?: string | null;
	};
	error?: string;
	success?: boolean;
}
