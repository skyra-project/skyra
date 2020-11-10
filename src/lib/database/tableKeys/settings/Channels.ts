import { Ignore as InternalIgnore } from './Channels/Ignore';

export enum Channels {
	Announcements = 'channelsAnnouncements',
	Greeting = 'channelsGreeting',
	Farewell = 'channelsFarewell',
	MemberLogs = 'channelsMemberLogs',
	MessageLogs = 'channelsMessageLogs',
	ModerationLogs = 'channelsModerationLogs',
	NSFWMessageLogs = 'channelsNsfwMessageLogs',
	ImageLogs = 'channelsImageLogs',
	PruneLogs = 'channelsPruneLogs',
	ReactionLogs = 'channelsReactionLogs',
	Spam = 'channelsSpam'
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Channels {
	export declare const Ignore: typeof InternalIgnore;
}
