/* eslint-disable @typescript-eslint/unified-signatures */
import type { GuildMemberFetchQueue } from '#lib/discord/GuildMemberFetchQueue';
import type { WorkerManager } from '#lib/moderation/workers/WorkerManager';
import type { AnalyticsData, InviteCodeValidEntry, InviteStore, ScheduleManager, SkyraCommand } from '#lib/structures';
import type { TwitchStreamStatus } from '#lib/types/AnalyticsSchema';
import type { EmojiObject } from '#utils/functions';
import type { LLRCData, LongLivingReactionCollector } from '#utils/LongLivingReactionCollector';
import type { Twitch } from '#utils/Notifications/Twitch';
import type { Guild as PrismaGuild } from '@prisma/client';
import type { Piece, Store } from '@sapphire/framework';
import type { NonNullObject, Nullish, PickByValue } from '@sapphire/utilities';
import type { ArrayString, BooleanString, IntegerString } from '@skyra/env-utilities';
import type { Image } from 'canvas-constructor/napi-rs';
import type { Guild, GuildChannel, Message, MessageEmbed, NewsChannel, Role, Snowflake, TextChannel, User } from 'discord.js';
import type { TaskErrorPayload, TwitchEventSubEvent, TwitchEventSubOnlineEvent } from './definitions';
import type { Events } from './Enums';
import type { CustomFunctionGet, CustomGet } from './Utils';

declare module 'discord.js' {
	interface Client {
		readonly dev: boolean;
		readonly analytics: AnalyticsData | null;
		readonly guildMemberFetchQueue: GuildMemberFetchQueue;
		readonly invites: InviteStore;
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
		schedule: ScheduleManager;
		workers: WorkerManager;
	}
}

declare module '@sapphire/framework' {
	interface ArgType {
		case: number;
		channelName: GuildChannel;
		cleanString: string;
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
			key: PickByValue<PrismaGuild, string | Nullish>,
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
		<K extends string, TArgs extends NonNullObject, TReturn>(key: CustomFunctionGet<K, TArgs, TReturn>, options?: TOptions<TArgs>): TReturn;
		<K extends string, TArgs extends NonNullObject, TReturn>(
			key: CustomFunctionGet<K, TArgs, TReturn>,
			defaultValue: TReturn,
			options?: TOptions<TArgs>
		): TReturn;
	}
}

declare module '@skyra/env-utilities' {
	export interface Env {
		CLIENT_NAME: string;
		CLIENT_VERSION: string;
		CLIENT_PREFIX: string;
		CLIENT_REGEX_PREFIX: string;
		CLIENT_OWNERS: ArrayString;
		CLIENT_ID: string;
		CLIENT_SHARDS: string;

		CLIENT_PRESENCE_NAME: string;
		CLIENT_PRESENCE_TYPE: string;

		SISTER_CLIENTS: ArrayString;

		API_ENABLED: BooleanString;
		API_ORIGIN: string;
		API_PORT: IntegerString;
		API_PREFIX: string;

		OAUTH_COOKIE: string;
		OAUTH_DOMAIN_OVERWRITE: string;
		OAUTH_REDIRECT_URI: string;
		OAUTH_SCOPE: ArrayString;
		OAUTH_SECRET: string;

		TWITCH_CALLBACK: string;

		PGSQL_DATABASE_NAME: string;
		PGSQL_DATABASE_PASSWORD: string;
		PGSQL_DATABASE_USER: string;
		PGSQL_DATABASE_PORT: IntegerString;
		PGSQL_DATABASE_HOST: string;
		TYPEORM_DEBUG_LOGS: BooleanString;

		INFLUX_ENABLED: BooleanString;
		INFLUX_URL: string;
		INFLUX_TOKEN: string;
		INFLUX_ORG: string;
		INFLUX_ORG_ANALYTICS_BUCKET: string;

		HASTEBIN_POST_URL: string;
		HASTEBIN_GET_URL: string;

		WEBHOOK_ERROR_ID: string;
		WEBHOOK_ERROR_TOKEN: string;

		WORKER_COUNT: IntegerString;

		DISCORD_TOKEN: string;
		BOTLIST_SPACE_TOKEN: string;
		BOTS_FOR_DISCORD_TOKEN: string;
		BOTS_ON_DISCORD_TOKEN: string;
		DISCORD_BOT_LIST_TOKEN: string;
		DISCORD_BOTS_TOKEN: string;
		SENTRY_URL: string;
		TOP_GG_TOKEN: string;
		TWITCH_CLIENT_ID: string;
		TWITCH_EVENTSUB_SECRET: string;
		TWITCH_TOKEN: string;
	}
}
