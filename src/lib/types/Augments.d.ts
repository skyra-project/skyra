/* eslint-disable @typescript-eslint/unified-signatures */
import type { NP, Queue, QueueClient, QueueClientOptions, QueueEntry } from '@lib/audio';
import type { SettingsManager } from '@lib/database';
import { GuildMemberFetchQueue } from '@lib/discord/GuildMemberFetchQueue';
import type { InviteStore } from '@lib/structures/InviteStore';
import type { GiveawayManager } from '@lib/structures/managers/GiveawayManager';
import type { ScheduleManager } from '@lib/structures/managers/ScheduleManager';
import type { WebsocketHandler } from '@lib/websocket/WebsocketHandler';
import type { ConnectFourManager } from '@utils/Games/ConnectFourManager';
import type { Leaderboard } from '@utils/Leaderboard';
import type { LongLivingReactionCollector } from '@utils/LongLivingReactionCollector';
import type { Twitch } from '@utils/Notifications/Twitch';
import type { AnalyticsSchema } from '@utils/Tracking/Analytics/AnalyticsSchema';
import type { AnalyticsData } from '@utils/Tracking/Analytics/structures/AnalyticsData';
import type { PermissionString } from 'discord.js';
import type { PoolConfig } from 'pg';
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

	interface TextChannel {
		sniped: Message | null;
		toString(): string;
	}

	interface VoiceChannel {
		readonly listeners: string[];
	}

	interface UserManager {
		getFromTag(tag: string): User | null;
	}

	interface MessageEmbed {
		splitFields(title: string, content: string | string[]): this;
		splitFields(content: string | string[]): this;
		/**
		 * Adds a field with both title and content set to a Zero Width Space
		 * @param inline whether the field should be inline, defaults to `false`
		 */
		addBlankField(inline?: boolean): this;
	}

	interface PartialSendAliases {
		sendLocale<K extends string, TReturn>(key: CustomGet<K, TReturn>, options?: MessageOptions | MessageAdditions): Promise<Message>;
		sendLocale<K extends string, TReturn>(
			key: CustomGet<K, TReturn>,
			options?: (MessageOptions & { split?: false }) | MessageAdditions
		): Promise<Message>;
		sendLocale<K extends string, TReturn>(
			key: CustomGet<K, TReturn>,
			options?: (MessageOptions & { split: true | SplitOptions }) | MessageAdditions
		): Promise<Message[]>;
		sendLocale<K extends string, TArgs, TReturn>(
			key: CustomFunctionGet<K, TArgs, TReturn>,
			localeArgs: [TArgs],
			options?: MessageOptions | MessageAdditions
		): Promise<Message>;
		sendLocale<K extends string, TArgs, TReturn>(
			key: CustomFunctionGet<K, TArgs, TReturn>,
			localeArgs: [TArgs],
			options?: (MessageOptions & { split?: false }) | MessageAdditions
		): Promise<Message>;
		sendLocale<K extends string, TArgs, TReturn>(
			key: CustomFunctionGet<K, TArgs, TReturn>,
			localeArgs: [TArgs],
			options?: (MessageOptions & { split: true | SplitOptions }) | MessageAdditions
		): Promise<Message[]>;
	}
}

declare module 'klasa' {
	interface KlasaClientOptions {
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

	interface Language {
		PERMISSIONS: Record<PermissionString, string>;
		HUMAN_LEVELS: Record<'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH', string>;
		duration(time: number, precision?: number): string;
		ordinal(cardinal: number): string;
		list(values: readonly string[], conjunction: string): string;
		groupDigits(number: number): string;

		get<K extends string, TReturn>(value: CustomGet<K, TReturn>): TReturn;
		get<K extends string, TArgs, TReturn>(value: CustomFunctionGet<K, TArgs, TReturn>, args: TArgs): TReturn;

		retrieve<K extends string, TReturn>(value: CustomGet<K, TReturn>): TReturn;
		retrieve<K extends string, TArgs, TReturn>(value: CustomFunctionGet<K, TArgs, TReturn>, args: TArgs): TReturn;
	}

	interface PieceDefaults {
		serializers?: AliasPieceOptions;
	}

	interface Argument {
		// @ts-expect-error 1070
		run<T>(arg: string | undefined, possible: Possible, message: Message, filter?: (entry: T) => boolean): any;
	}

	type PostgresOptions = Omit<PoolConfig, 'stream' | 'ssl'> & Record<PropertyKey, unknown>;
}

declare module 'klasa-dashboard-hooks' {
	interface AuthData {
		token: string;
		refresh: string;
		user_id: string;
		expires: number;
	}
}
