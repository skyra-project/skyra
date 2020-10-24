import { Ignore as InternalIgnore } from './Channels/Ignore';

export enum Channels {
	Announcements = 'channels.announcements',
	Greeting = 'channels.greeting',
	Farewell = 'channels.farewell',
	MemberLogs = 'channels.member-logs',
	MessageLogs = 'channels.message-logs',
	ModerationLogs = 'channels.moderation-logs',
	NSFWMessageLogs = 'channels.nsfw-message-logs',
	ImageLogs = 'channels.image-logs',
	PruneLogs = 'channels.prune-logs',
	ReactionLogs = 'channels.reaction-logs',
	Spam = 'channels.spam'
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Channels {
	export declare const Ignore: typeof InternalIgnore;
}
