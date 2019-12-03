import { CustomGet } from './settings/Shared';
import { PermissionString } from 'discord.js';
import { LanguageKeys } from './Languages';
import { Leaderboard } from '../util/Leaderboard';
import { IPCMonitorStore } from '../structures/IPCMonitorStore';
import { GiveawayManager } from '../structures/GiveawayManager';
import { ConnectFourManager } from '../util/Games/ConnectFourManager';
import { LongLivingReactionCollector } from '../util/LongLivingReactionCollector';
import { FSWatcher } from 'chokidar';
import { Node as Lavalink, BaseNodeOptions } from 'lavalink';
import { Client as VezaClient } from 'veza';
import { CommonQuery } from '../queries/common';
import { UserTags } from '../util/Cache/UserTags';
import { Twitch } from '../util/Notifications/Twitch';
import { InfluxDB } from 'influx';

declare module 'discord.js' {

	interface Client {
		version: string;
		leaderboard: Leaderboard;
		ipcMonitors: IPCMonitorStore;
		giveaways: GiveawayManager;
		connectFour: ConnectFourManager;
		lavalink: Lavalink | null;
		userTags: UserTags;
		llrCollectors: Set<LongLivingReactionCollector>;
		ipc: VezaClient;
		webhookError: Webhook;
		fsWatcher: FSWatcher | null;
		queries: CommonQuery;
		influx: InfluxDB | null;
		twitch: Twitch;
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
	}

	interface GuildMember {
		fetchRank(): Promise<number>;
	}

	interface User {
		profileLevel: number;
		fetchRank(): Promise<number>;
	}

	interface MessageEmbed {
		splitFields(content: string | string[]): this;
	}

}

declare module 'klasa' {

	interface KlasaClientOptions {
		dev?: boolean;
		nms?: {
			role?: number;
			everyone?: number;
		};
		lavalink?: BaseNodeOptions;
	}

	interface PieceDefaults {
		ipcMonitors?: PieceOptions;
		rawEvents?: PieceOptions;
	}

	interface GatewaysOptions {
		members?: GatewayOptions;
	}

	interface Language {
		PERMISSIONS: Record<PermissionString, string>;
		HUMAN_LEVELS: Record<0 | 1 | 2 | 3 | 4, string>;
		duration(time: number): string;
		ordinal(cardinal: number): string;

		get<T extends LanguageKeysSimple>(term: T): LanguageKeys[T];
		get<T extends LanguageKeysComplex>(term: T, ...args: Parameters<LanguageKeys[T]>): ReturnType<LanguageKeys[T]>;
		tget<T extends LanguageKeysSimple>(term: T): LanguageKeys[T];
		tget<T extends LanguageKeysComplex>(term: T, ...args: Parameters<LanguageKeys[T]>): ReturnType<LanguageKeys[T]>;
		retrieve<T extends LanguageKeysSimple>(term: T): LanguageKeys[T];
		retrieve<T extends LanguageKeysComplex>(term: T, ...args: Parameters<LanguageKeys[T]>): ReturnType<LanguageKeys[T]>;
	}

	interface SettingsFolder {
		get<K extends string, S>(key: CustomGet<K, S>): S;
		get(key: string): SettingsFolder | SettingsValue | readonly SettingsValue[];
		increase(key: string, value: number): Promise<SettingsFolderUpdateResult>;
		decrease(key: string, value: number): Promise<SettingsFolderUpdateResult>;
	}

}

declare module 'klasa-dashboard-hooks' {

	interface AuthData {
		user_id: string;
	}

}

interface Fn {
	(...args: readonly any[]): unknown;
}

export type LanguageKeysSimple = {
	[K in keyof LanguageKeys]: LanguageKeys[K] extends Fn ? never : K;
}[keyof LanguageKeys];

export type LanguageKeysComplex = {
	[K in keyof LanguageKeys]: LanguageKeys[K] extends Fn ? K : never;
}[keyof LanguageKeys];
