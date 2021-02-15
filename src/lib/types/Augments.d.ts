/* eslint-disable @typescript-eslint/unified-signatures */
import type { NP, Queue, QueueClient, QueueClientOptions, QueueEntry } from '#lib/audio';
import type { SettingsManager } from '#lib/database';
import type { GuildMemberFetchQueue } from '#lib/discord/GuildMemberFetchQueue';
import type {
	AnalyticsData,
	ColorHandler,
	ConnectFourManager,
	GiveawayManager,
	InviteCodeValidEntry,
	InviteStore,
	ScheduleManager,
	SkyraCommand
} from '#lib/structures';
import type { AnalyticsSchema } from '#lib/types/AnalyticsSchema';
import type { WebsocketHandler } from '#lib/websocket/WebsocketHandler';
import type { O } from '#utils/constants';
import type { Leaderboard } from '#utils/Leaderboard';
import type { LongLivingReactionCollector } from '#utils/LongLivingReactionCollector';
import type { Twitch } from '#utils/Notifications/Twitch';
import type { Events, Piece, Store } from '@sapphire/framework';
import type { Image } from 'canvas';
import type {
	APIMessage,
	APIMessageContentResolvable,
	GuildChannel,
	Message,
	MessageAdditions,
	MessageExtendablesAskOptions,
	MessageOptions,
	NewsChannel,
	Role,
	Snowflake,
	SplitOptions,
	StringResolvable,
	TextChannel,
	User
} from 'discord.js';
import type { Scope } from './definitions/ArgumentTypes';
import type { MessageAcknowledgeable } from './Discord';
import type { CustomFunctionGet, CustomGet } from './Utils';

declare module 'discord.js' {
	interface Client {
		readonly analytics: AnalyticsData | null;
		readonly audio: QueueClient;
		readonly connectFour: ConnectFourManager;
		readonly giveaways: GiveawayManager;
		readonly guildMemberFetchQueue: GuildMemberFetchQueue;
		readonly invites: InviteStore;
		readonly leaderboard: Leaderboard;
		readonly llrCollectors: Set<LongLivingReactionCollector>;
		readonly schedules: ScheduleManager;
		readonly settings: SettingsManager;
		readonly twitch: Twitch;
		readonly version: string;
		readonly webhookDatabase: Webhook | null;
		readonly webhookError: Webhook;
		readonly webhookFeedback: Webhook | null;
		readonly websocket: WebsocketHandler;
	}

	interface ClientOptions {
		audio: QueueClientOptions;
		dev?: boolean;
		nms?: {
			role?: number;
			everyone?: number;
		};
		schedule?: {
			interval: number;
		};
	}

	export interface ClientEvents {
		[Events.AnalyticsSync]: [guilds: number, users: number];
		[Events.CommandUsageAnalytics]: [command: string, category: string, subCategory: string];
		[Events.GuildAnnouncementSend]: [message: Message, resultMessage: Message, channel: TextChannel, role: Role, content: string];
		[Events.GuildAnnouncementEdit]: [message: Message, resultMessage: Message, channel: TextChannel, role: Role, content: string];
		[Events.GuildAnnouncementError]: [message: Message, channel: TextChannel, role: Role, content: string, error: any];
		[Events.MoneyTransaction]: [target: User, moneyChange: number, moneyBeforeChange: number];
		[Events.MoneyPayment]: [message: Message, user: User, target: User, money: number];
		[Events.MusicAddNotify]: [channel: MessageAcknowledgeable, tracks: readonly QueueEntry[]];
		[Events.MusicFinish]: [queue: Queue];
		[Events.MusicFinishNotify]: [channel: MessageAcknowledgeable];
		[Events.MusicLeave]: [queue: Queue];
		[Events.MusicPrune]: [queue: Queue];
		[Events.MusicQueueSync]: [queue: Queue];
		[Events.MusicRemove]: [queue: Queue];
		[Events.MusicRemoveNotify]: [channel: MessageAcknowledgeable, entry: QueueEntry];
		[Events.MusicReplayUpdate]: [queue: Queue, repeating: boolean];
		[Events.MusicReplayUpdateNotify]: [channel: MessageAcknowledgeable, repeating: boolean];
		[Events.MusicSongPause]: [queue: Queue];
		[Events.MusicSongPauseNotify]: [channel: MessageAcknowledgeable];
		[Events.MusicSongPlay]: [queue: Queue, status: NP];
		[Events.MusicSongPlayNotify]: [channel: MessageAcknowledgeable, entry: QueueEntry];
		[Events.MusicSongReplay]: [queue: Queue, status: NP];
		[Events.MusicSongResume]: [queue: Queue];
		[Events.MusicSongResumeNotify]: [channel: MessageAcknowledgeable];
		[Events.MusicSongSeekUpdate]: [queue: Queue];
		[Events.MusicSongSeekUpdateNotify]: [channel: MessageAcknowledgeable, time: number];
		[Events.MusicSongSkip]: [queue: Queue];
		[Events.MusicSongSkipNotify]: [channel: MessageAcknowledgeable, entry: QueueEntry];
		[Events.MusicSongVolumeUpdate]: [queue: Queue, next: number];
		[Events.MusicSongVolumeUpdateNotify]: [channel: MessageAcknowledgeable, previous: number, next: number];
		[Events.MusicVoiceChannelJoin]: [queue: Queue, voiceChannel: VoiceChannel];
		[Events.MusicVoiceChannelLeave]: [queue: Queue];
		[Events.MusicConnect]: [queue: Queue, voiceChannelID: string];
		[Events.ResourceAnalyticsSync]: [];
		[Events.TwitchStreamHookedAnalytics]: [status: AnalyticsSchema.TwitchStreamStatus];
	}
}

declare module '@sapphire/framework' {
	interface ArgType {
		case: number;
		channelName: GuildChannel;
		cleanString: string;
		color: ColorHandler;
		command: SkyraCommand;
		commandName: SkyraCommand;
		duration: Date;
		emoji: string;
		image: Image;
		invite: InviteCodeValidEntry;
		language: string;
		overwatchPlayer: string;
		piece: Piece;
		range: number[];
		reset: true;
		roleName: Role;
		scope: Scope;
		shinyWager: number;
		snowflake: Snowflake;
		song: string[];
		store: Store<Piece>;
		textChannelName: TextChannel;
		textOrNewsChannelName: TextChannel | NewsChannel;
		time: Date;
		timespan: number;
		userName: User;
	}

	export enum Events {
		AnalyticsSync = 'analyticsSync',
		ApiError = 'apiError',
		ArgumentError = 'argumentError',
		CommandUsageAnalytics = 'commandUsageAnalytics',
		GuildAnnouncementEdit = 'guildAnnouncementEdit',
		GuildAnnouncementError = 'guildAnnouncementError',
		GuildAnnouncementSend = 'guildAnnouncementSend',
		GuildMessageDelete = 'guildMessageDelete',
		GuildMessageLog = 'guildMessageLog',
		GuildMessageUpdate = 'guildMessageUpdate',
		GuildUserMessage = 'guildUserMessage',
		LavalinkClose = 'lavalinkClose',
		LavalinkEnd = 'lavalinkEnd',
		LavalinkException = 'lavalinkException',
		LavalinkPlayerUpdate = 'lavalinkPlayerUpdate',
		LavalinkStart = 'lavalinkStart',
		LavalinkStuck = 'lavalinkStuck',
		LavalinkWebsocketClosed = 'lavalinkWebsocketClosed',
		MentionSpamExceeded = 'mentionSpamExceeded',
		MentionSpamWarning = 'mentionSpamWarning',
		ModerationEntryAdd = 'moderationEntryAdd',
		ModerationEntryEdit = 'moderationEntryEdit',
		MoneyPayment = 'moneyPayment',
		MoneyTransaction = 'moneyTransaction',
		MusicAddNotify = 'musicAddNotify',
		MusicConnect = 'musicConnect',
		MusicFinish = 'musicFinish',
		MusicFinishNotify = 'musicFinishNotify',
		MusicLeave = 'musicLeave',
		MusicPrune = 'musicPrune',
		MusicQueueSync = 'musicQueueSync',
		MusicRemove = 'musicRemove',
		MusicRemoveNotify = 'musicRemoveNotify',
		MusicReplayUpdate = 'musicReplayUpdate',
		MusicReplayUpdateNotify = 'musicReplayUpdateNotify',
		MusicSongPause = 'musicSongPause',
		MusicSongPauseNotify = 'musicSongPauseNotify',
		MusicSongPlay = 'musicSongPlay',
		MusicSongPlayNotify = 'musicSongPlayNotify',
		MusicSongReplay = 'musicSongReplay',
		MusicSongResume = 'musicSongResume',
		MusicSongResumeNotify = 'musicSongResumeNotify',
		MusicSongSeekUpdate = 'musicSongSeekUpdate',
		MusicSongSeekUpdateNotify = 'musicSongSeekUpdateNotify',
		MusicSongSkip = 'musicSongSkip',
		MusicSongSkipNotify = 'musicSongSkipNotify',
		MusicSongVolumeUpdate = 'musicSongVolumeUpdate',
		MusicSongVolumeUpdateNotify = 'musicSongVolumeUpdateNotify',
		MusicVoiceChannelJoin = 'musicVoiceChannelJoin',
		MusicVoiceChannelLeave = 'musicVoiceChannelLeave',
		NotMutedMemberAdd = 'notMutedMemberAdd',
		Raw = 'raw',
		RawMemberAdd = 'rawMemberAdd',
		RawMemberRemove = 'rawMemberRemove',
		RawMessageCreate = 'rawMessageCreate',
		RawMessageDelete = 'rawMessageDelete',
		RawMessageDeleteBulk = 'rawMessageDeleteBulk',
		RawReactionAdd = 'rawReactionAdd',
		RawReactionRemove = 'rawReactionRemove',
		ReactionBlacklist = 'reactionBlacklist',
		Reconnecting = 'reconnecting',
		ResourceAnalyticsSync = 'resourceAnalyticsSync',
		SettingsUpdate = 'settingsUpdate',
		TaskError = 'taskError',
		TwitchStreamHookedAnalytics = 'twitchStreamHookedAnalytics',
		TwitchStreamOffline = 'twitchStreamOffline',
		TwitchStreamOnline = 'twitchStreamOnline',
		UnhandledRejection = 'unhandledRejection',
		UserMessage = 'userMessage'
	}
}

declare module 'i18next' {
	export interface TFunction {
		lng: string;
		ns?: string;

		<K extends string, TReturn>(key: CustomGet<K, TReturn>, options?: TOptionsBase | string): TReturn;
		<K extends string, TReturn>(key: CustomGet<K, TReturn>, defaultValue: TReturn, options?: TOptionsBase | string): TReturn;
		<K extends string, TArgs extends O, TReturn>(key: CustomFunctionGet<K, TArgs, TReturn>, options?: TOptions<TArgs>): TReturn;
		<K extends string, TArgs extends O, TReturn>(
			key: CustomFunctionGet<K, TArgs, TReturn>,
			defaultValue: TReturn,
			options?: TOptions<TArgs>
		): TReturn;
	}
}

declare module '@sapphire/plugin-i18next' {
	export interface I18nextMessageImplementation {
		reactable: boolean;
		fetchLanguage(): Promise<string>;
		prompt(content: string, time?: number): Promise<Message>;
		ask(content: string, options?: MessageOptions, promptOptions?: MessageExtendablesAskOptions): Promise<boolean | null>;
		ask(options?: MessageOptions, promptOptions?: MessageExtendablesAskOptions): Promise<boolean | null>;
		alert(content: string, timer?: number): Promise<Message>;
		alert(content: string, options?: number | MessageOptions, timer?: number): Promise<Message>;
		nuke(time?: number): Promise<Message>;
		readonly responses: readonly Message[];
		send(
			content:
				| APIMessageContentResolvable
				| (MessageOptions & {
						split?: false;
				  })
				| MessageAdditions
		): Promise<Message>;
		send(
			options: MessageOptions & {
				split: true | SplitOptions;
			}
		): Promise<Message[]>;
		send(options: MessageOptions | APIMessage): Promise<Message | Message[]>;
		send(
			content: StringResolvable,
			options:
				| (MessageOptions & {
						split?: false;
				  })
				| MessageAdditions
		): Promise<Message>;
		send(
			content: StringResolvable,
			options: MessageOptions & {
				split: true | SplitOptions;
			}
		): Promise<Message[]>;
		send(content: StringResolvable, options: MessageOptions): Promise<Message | Message[]>;
	}
}
