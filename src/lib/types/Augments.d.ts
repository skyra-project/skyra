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
import type { Piece, Store } from '@sapphire/framework';
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
import type { Events } from './Enums';
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

		emit(event: Events.AnalyticsSync, guilds: number, users: number): boolean;
		emit(event: Events.CommandUsageAnalytics, command: string, category: string, subCategory: string): boolean;
		emit(
			event: Events.GuildAnnouncementSend | Events.GuildAnnouncementEdit,
			message: Message,
			resultMessage: Message,
			channel: TextChannel,
			role: Role,
			content: string
		): boolean;
		emit(event: Events.GuildAnnouncementError, message: Message, channel: TextChannel, role: Role, content: string, error: any): boolean;
		emit(event: Events.MoneyTransaction, target: User, moneyChange: number, moneyBeforeChange: number): boolean;
		emit(event: Events.MoneyPayment, message: Message, user: User, target: User, money: number): boolean;
		emit(event: Events.MusicAddNotify, channel: MessageAcknowledgeable, tracks: readonly QueueEntry[]): boolean;
		emit(event: Events.MusicFinish, queue: Queue): boolean;
		emit(event: Events.MusicFinishNotify, channel: MessageAcknowledgeable): boolean;
		emit(event: Events.MusicLeave, queue: Queue): boolean;
		emit(event: Events.MusicPrune, queue: Queue): boolean;
		emit(event: Events.MusicQueueSync, queue: Queue): boolean;
		emit(event: Events.MusicRemove, queue: Queue): boolean;
		emit(event: Events.MusicRemoveNotify, channel: MessageAcknowledgeable, entry: QueueEntry): boolean;
		emit(event: Events.MusicReplayUpdate, queue: Queue, repeating: boolean): boolean;
		emit(event: Events.MusicReplayUpdateNotify, channel: MessageAcknowledgeable, repeating: boolean): boolean;
		emit(event: Events.MusicSongPause, queue: Queue): boolean;
		emit(event: Events.MusicSongPauseNotify, channel: MessageAcknowledgeable): boolean;
		emit(event: Events.MusicSongPlay, queue: Queue, status: NP): boolean;
		emit(event: Events.MusicSongPlayNotify, channel: MessageAcknowledgeable, entry: QueueEntry): boolean;
		emit(event: Events.MusicSongReplay, queue: Queue, status: NP): boolean;
		emit(event: Events.MusicSongResume, queue: Queue): boolean;
		emit(event: Events.MusicSongResumeNotify, channel: MessageAcknowledgeable): boolean;
		emit(event: Events.MusicSongSeekUpdate, queue: Queue): boolean;
		emit(event: Events.MusicSongSeekUpdateNotify, channel: MessageAcknowledgeable, time: number): boolean;
		emit(event: Events.MusicSongSkip, queue: Queue): boolean;
		emit(event: Events.MusicSongSkipNotify, channel: MessageAcknowledgeable, entry: QueueEntry): boolean;
		emit(event: Events.MusicSongVolumeUpdate, queue: Queue, next: number): boolean;
		emit(event: Events.MusicSongVolumeUpdateNotify, channel: MessageAcknowledgeable, previous: number, next: number): boolean;
		emit(event: Events.MusicVoiceChannelJoin, queue: Queue, voiceChannel: VoiceChannel): boolean;
		emit(event: Events.MusicVoiceChannelLeave, queue: Queue): boolean;
		emit(event: Events.MusicConnect, queue: Queue, voiceChannelID: string): boolean;
		emit(event: Events.ResourceAnalyticsSync): boolean;
		emit(event: Events.TwitchStreamHookedAnalytics, status: AnalyticsSchema.TwitchStreamStatus): boolean;
		emit(event: string | symbol, ...args: any[]): boolean;
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
