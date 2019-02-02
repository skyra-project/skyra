import { MasterPool, R } from "rethinkdb-ts";
import { Leaderboard } from "../util/Leaderboard";
import { IPCMonitorStore } from "../structures/IPCMonitorStore";
import { RawEventStore } from "../structures/RawEventStore";
import { ConnectFourManager } from "../util/Games/ConnectFourManager";
import { LongLivingReactionCollector } from "../util/LongLivingReactionCollector";

declare module 'discord.js' {

	interface Client {
		version: string;
		leaderboard: Leaderboard;
		ipcMonitors: IPCMonitorStore;
		rawEvents: RawEventStore;
		connectFour: ConnectFourManager;
		usertags: Collection<string, string>;
		llrCollectors: Set<LongLivingReactionCollector>;
		ipc: Node;
		webhookError: Webhook;
		fetchTag(id: string): Promise<string>;
		fetchUsername(id: string): Promise<string>;
	}

	interface MessageExtendablesAskOptions {
		time?: number;
		max?: number;
	}

	interface Message {
		prompt(content: string, time?: number): Promise<Message>;
		ask(content: string, options?: MessageOptions, promptOptions?: MessageExtendablesAskOptions): Promise<boolean>;
		alert(content: string, timer?: number): Promise<Message>;
		alert(content: string, options?: number | MessageOptions, timer?: number): Promise<Message>;
		nuke(time?: number): Promise<Message>;
	}

	interface GuildMember {
		fetchRank(): Promise<number>;
	}

	interface User {
		fetchRank(): Promise<number>;
	}

	interface MessageEmbed {
		splitFields(content: string | string[]): this;
	}

}

declare module 'klasa' {

	interface Language {
		retrieve(key: string): any;
		duration(time: number): string;
	}

	interface SettingsFolder {
		increase(key: string, value: number): Promise<SettingsFolderUpdateResult>;
		decrease(key: string, value: number): Promise<SettingsFolderUpdateResult>;
	}

	interface Provider {
		db: R;
		pool: MasterPool;
		ping(): Promise<number>;
		sync(table: string): Promise<{ synced: number }>;
		getRandom(table: string): Promise<any>;
	}

	interface KlasaClientOptions {
		dev?: boolean;
		nms?: {
			role?: number;
			everyone?: number;
		};
	}

	interface PieceDefaults {
		ipcMonitors?: PieceOptions;
		rawEvents?: PieceOptions;
	}

}
