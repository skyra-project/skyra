/* eslint-disable @typescript-eslint/unified-signatures */
import type { SettingsUpdateResults } from '@klasa/settings-gateway';
import type { InviteStore } from '@lib/structures/InviteStore';
import type { IPCMonitorStore } from '@lib/structures/IPCMonitorStore';
import type { GiveawayManager } from '@lib/structures/managers/GiveawayManager';
import type { ScheduleManager } from '@lib/structures/managers/ScheduleManager';
import type { ConnectFourManager } from '@utils/Games/ConnectFourManager';
import type { Leaderboard } from '@utils/Leaderboard';
import type { LongLivingReactionCollector } from '@utils/LongLivingReactionCollector';
import type { Manager as LavalinkManager } from '@utils/Music/ManagerWrapper';
import type { Twitch } from '@utils/Notifications/Twitch';
import type { AnalyticsSchema } from '@utils/Tracking/Analytics/AnalyticsSchema';
import type { AnalyticsData } from '@utils/Tracking/Analytics/structures/AnalyticsData';
import type { APIUser, GatewayGuildMemberUpdateDispatch } from 'discord-api-types/v6';
import type { PermissionString } from 'discord.js';
import type { KlasaMessage, SettingsFolderUpdateOptions } from 'klasa';
import type { LavalinkNodeOptions } from 'lavacord';
import type { PoolConfig } from 'pg';
import type { Client as VezaClient } from 'veza';
import type { Events } from './Enums';
import type { CustomFunctionGet, CustomGet } from './Shared';

declare module 'discord.js' {
	interface Client {
		version: string;
		leaderboard: Leaderboard;
		ipcMonitors: IPCMonitorStore;
		giveaways: GiveawayManager;
		schedules: ScheduleManager;
		invites: InviteStore;
		analytics: AnalyticsData | null;
		connectFour: ConnectFourManager;
		lavalink: LavalinkManager;
		llrCollectors: Set<LongLivingReactionCollector>;
		ipc: VezaClient;
		webhookError: Webhook;
		webhookFeedback: Webhook | null;
		webhookDatabase: Webhook | null;
		twitch: Twitch;

		emit(event: Events.AnalyticsSync, guilds: number, users: number): boolean;
		emit(event: Events.CommandUsageAnalytics, command: string, category: string, subCategory: string): boolean;
		emit(
			event: Events.GuildAnnouncementSend | Events.GuildAnnouncementEdit,
			message: KlasaMessage,
			resultMessage: KlasaMessage,
			channel: TextChannel,
			role: Role,
			content: string
		): boolean;
		emit(event: Events.GuildAnnouncementError, message: KlasaMessage, channel: TextChannel, role: Role, content: string, error: any): boolean;
		emit(event: Events.MoneyTransaction, target: User, moneyChange: number, moneyBeforeChange: number): boolean;
		emit(event: Events.MoneyPayment, message: KlasaMessage, user: User, target: User, money: number): boolean;
		emit(event: Events.ResourceAnalyticsSync): boolean;
		emit(event: Events.TwitchStreamHookedAnalytics, status: AnalyticsSchema.TwitchStreamStatus): boolean;
		emit(event: string | symbol, ...args: any[]): boolean;
	}

	interface MessageExtendablesAskOptions {
		time?: number;
		max?: number;
	}

	interface Message {
		prompt(content: string, time?: number): Promise<Message>;
		ask(options?: MessageOptions, promptOptions?: MessageExtendablesAskOptions): Promise<boolean>;
		ask(content: string, options?: MessageOptions, promptOptions?: MessageExtendablesAskOptions): Promise<boolean>;
		alert(content: string, timer?: number): Promise<Message>;
		alert(content: string, options?: number | MessageOptions, timer?: number): Promise<Message>;
		nuke(time?: number): Promise<Message>;
	}

	interface TextChannel {
		sniped: Message | null;
		toString(): string;
	}

	interface GuildMember {
		fetchRank(): Promise<number>;
		isDJ: boolean;
		isStaff: boolean;
		isMod: boolean;
		isAdmin: boolean;

		_patch(data: GatewayGuildMemberUpdateDispatch['d']): void;
	}

	interface User {
		fetchRank(): Promise<number>;
		_patch(data: APIUser): void;
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
		sendLocale<K extends string, TReturn>(key: CustomGet<K, TReturn>, options?: MessageOptions | MessageAdditions): Promise<KlasaMessage>;
		sendLocale<K extends string, TReturn>(
			key: CustomGet<K, TReturn>,
			options?: (MessageOptions & { split?: false }) | MessageAdditions
		): Promise<KlasaMessage>;
		sendLocale<K extends string, TReturn>(
			key: CustomGet<K, TReturn>,
			options?: (MessageOptions & { split: true | SplitOptions }) | MessageAdditions
		): Promise<KlasaMessage[]>;
		sendLocale<K extends string, TArgs, TReturn>(
			key: CustomFunctionGet<K, TArgs, TReturn>,
			localeArgs: [TArgs],
			options?: MessageOptions | MessageAdditions
		): Promise<KlasaMessage>;
		sendLocale<K extends string, TArgs, TReturn>(
			key: CustomFunctionGet<K, TArgs, TReturn>,
			localeArgs: [TArgs],
			options?: (MessageOptions & { split?: false }) | MessageAdditions
		): Promise<KlasaMessage>;
		sendLocale<K extends string, TArgs, TReturn>(
			key: CustomFunctionGet<K, TArgs, TReturn>,
			localeArgs: [TArgs],
			options?: (MessageOptions & { split: true | SplitOptions }) | MessageAdditions
		): Promise<KlasaMessage[]>;
	}
}

declare module 'klasa' {
	interface KlasaClientOptions {
		dev?: boolean;
		nms?: {
			role?: number;
			everyone?: number;
		};
		schedule?: {
			interval: number;
		};
		lavalink?: LavalinkNodeOptions[];
	}

	interface PieceDefaults {
		ipcMonitors?: PieceOptions;
		rawEvents?: PieceOptions;
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

	interface SettingsFolder {
		get<K extends string, S>(key: CustomGet<K, S>): S;
		increase(key: string, value: number, options?: SettingsFolderUpdateOptions): Promise<SettingsUpdateResults>;
		decrease(key: string, value: number, options?: SettingsFolderUpdateOptions): Promise<SettingsUpdateResults>;
	}

	interface Argument {
		// @ts-expect-error 1070
		run<T>(arg: string | undefined, possible: Possible, message: KlasaMessage, filter?: (entry: T) => boolean): any;
	}

	type PostgresOptions = Omit<PoolConfig, 'stream' | 'ssl'> & Record<PropertyKey, unknown>;

	export interface ProvidersOptions extends Record<string, any> {
		default?: 'postgres' | string;
		postgres: PostgresOptions;
	}
}

declare module 'klasa-dashboard-hooks' {
	interface AuthData {
		token: string;
		refresh: string;
		user_id: string;
		expires: number;
	}
}
