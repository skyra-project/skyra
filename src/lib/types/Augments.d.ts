/* eslint-disable @typescript-eslint/unified-signatures */
import type { DbSet, GuildEntity, SettingsManager } from '#lib/database';
import type { GuildMemberFetchQueue } from '#lib/discord/GuildMemberFetchQueue';
import type { ModelStore } from '#lib/grpc';
import type { WorkerManager } from '#lib/moderation/workers/WorkerManager';
import type { AnalyticsData, ColorHandler, InviteCodeValidEntry, InviteStore, ScheduleManager, SkyraCommand } from '#lib/structures';
import type { TwitchStreamStatus } from '#lib/types/AnalyticsSchema';
import type { O } from '#utils/constants';
import type { EmojiObject } from '#utils/functions';
import type { Leaderboard } from '#utils/Leaderboard';
import type { LLRCData, LongLivingReactionCollector } from '#utils/LongLivingReactionCollector';
import type { Twitch } from '#utils/Notifications/Twitch';
import type { Piece, Store } from '@sapphire/framework';
import type { Nullish, PickByValue } from '@sapphire/utilities';
import type { Image } from 'canvas-constructor/skia';
import type { Guild, GuildChannel, Message, MessageEmbed, NewsChannel, Role, Snowflake, TextChannel, User, VoiceChannel } from 'discord.js';
import type { TaskErrorPayload, TwitchEventSubEvent, TwitchEventSubOnlineEvent } from './definitions';
import type { Scope } from './definitions/ArgumentTypes';
import type { Events } from './Enums';
import type { CustomFunctionGet, CustomGet } from './Utils';

declare module 'discord.js' {
	interface Client {
		readonly dev: boolean;
		readonly analytics: AnalyticsData | null;
		readonly guildMemberFetchQueue: GuildMemberFetchQueue;
		readonly invites: InviteStore;
		readonly leaderboard: Leaderboard;
		readonly llrCollectors: Set<LongLivingReactionCollector>;
		readonly schedules: ScheduleManager;
		readonly twitch: Twitch;
		readonly version: string;
		readonly webhookError: WebhookClient | null;
	}

	interface ClientEvents {
		[Events.TaskError]: [error: Error, payload: TaskErrorPayload];
	}

	interface ClientOptions {
		nms?: {
			role?: number;
			everyone?: number;
		};
		schedule?: {
			interval: number;
		};
	}
}

declare module '@sapphire/pieces' {
	interface Container {
		db: DbSet;
		grpc: ModelStore;
		schedule: ScheduleManager;
		settings: SettingsManager;
		workers: WorkerManager;
	}
}

declare module '@sapphire/framework' {
	interface ArgType {
		case: number;
		channelName: GuildChannel;
		cleanString: string;
		color: ColorHandler;
		command: SkyraCommand;
		commandMatch: string;
		commandName: SkyraCommand;
		duration: Date;
		emoji: EmojiObject;
		image: Image;
		invite: InviteCodeValidEntry;
		language: string;
		piece: Piece;
		range: number[];
		reset: true;
		roleName: Role;
		scope: Scope;
		shinyWager: number;
		snowflake: Snowflake;
		store: Store<Piece>;
		textChannelName: TextChannel;
		textOrNewsChannelName: TextChannel | NewsChannel;
		time: Date;
		timespan: number;
		userName: User;
	}

	interface Preconditions {
		Administrator: never;
		BotOwner: never;
		Everyone: never;
		Moderator: never;
		ServerOwner: never;
	}

	interface SapphireClient {
		emit(event: Events.Error, error: Error): boolean;
		emit(event: Events.AnalyticsSync, guilds: number, users: number): boolean;
		emit(event: Events.CommandUsageAnalytics, command: string, category: string): boolean;
		emit(
			event: Events.GuildMessageLog,
			guild: Guild,
			channelId: string | Nullish,
			key: PickByValue<GuildEntity, string | Nullish>,
			makeMessage: () => Promise<MessageEmbed> | MessageEmbed
		): boolean;
		emit(event: Events.ReactionBlocked, data: LLRCData, emoji: string): boolean;
		emit(event: Events.MoneyTransaction, target: User, moneyChange: number, moneyBeforeChange: number): boolean;
		emit(event: Events.MoneyPayment, message: Message, user: User, target: User, money: number): boolean;
		emit(event: Events.ResourceAnalyticsSync): boolean;
		emit(event: Events.TwitchStreamHookedAnalytics, status: TwitchStreamStatus): boolean;
		emit(events: Events.TwitchStreamOnline, event: TwitchEventSubOnlineEvent): boolean;
		emit(events: Events.TwitchStreamOffline, event: TwitchEventSubEvent): boolean;
		emit(event: Events.TaskError, error: Error, payload: TaskErrorPayload): boolean;
		emit(event: string | symbol, ...args: any[]): boolean;
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
