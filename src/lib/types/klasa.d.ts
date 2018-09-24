import Skyra from '../Skyra';
import {
	SkyraGuildMember,
	SkyraGuildMemberStore
} from './discord.js';
import {
	Command,
	Event,
	Extendable,
	Finalizer,
	Inhibitor,
	KlasaGuild,
	KlasaMessage,
	KlasaUser,
	Language,
	Monitor,
	PermissionLevelOptions,
	PermissionLevels,
	Possible,
	Provider,
	ProviderStore,
	Settings,
	Task
} from 'klasa';
import {
	Collection,
	GuildEditData,
	GuildMemberEditData,
	MessageOptions,
	Snowflake
} from 'discord.js';
import rebirthdb from '../../providers/rebirthdb';

declare class SkyraPermissionLevels extends PermissionLevels {
	// @ts-ignore
	public add(level: number, check: (client: Skyra, message: SkyraMessage) => boolean, options?: PermissionLevelOptions): this;
}

export { SkyraPermissionLevels as PermissionLevels };

declare abstract class SkyraCommand extends Command {
	public client: Skyra;
	// @ts-ignore
	public createCustomResolver(type: string, resolver: (arg: string, possible: Possible, message: SkyraMessage, params: string[]) => any): this;
	public inhibit(msg: SkyraMessage): Promise<boolean>;
}

export { SkyraCommand as Command };

declare abstract class SkyraEvent extends Event {
	public client: Skyra;
}

export { SkyraEvent as Event };

declare abstract class SkyraExtendable extends Extendable {
	public client: Skyra;
}

export { SkyraExtendable as Extendable };

declare abstract class SkyraFinalizer extends Finalizer {
	public client: Skyra;
}

export { SkyraFinalizer as Finalizer };

declare abstract class SkyraInhibitor extends Inhibitor {
	public client: Skyra;
}

export { SkyraInhibitor as Inhibitor };

declare abstract class SkyraLanguage extends Language {
	public client: Skyra;
}

export { SkyraLanguage as Language };

declare abstract class SkyraMonitor extends Monitor {
	public client: Skyra;
}

export { SkyraMonitor as Monitor };

declare abstract class SkyraProvider extends Provider {
	public client: Skyra;
}

export { SkyraProvider as Provider };

declare abstract class SkyraProviderStore extends ProviderStore {
	public client: Skyra;
	public default: rebirthdb;
}

export { SkyraProviderStore as ProviderStore };

declare abstract class SkyraTask extends Task {
	public client: Skyra;
}

export { SkyraTask as Task };

export class SkyraMessage extends KlasaMessage {
	public guildSettings: GuildSettings;
	// @ts-ignore
	public guild: SkyraGuild;
	public alert(content: string | Array<string>, timer?: number): SkyraMessage;
	public alert(content: string | Array<string>, options?: MessageOptions, timer?: number): SkyraMessage;
	public ask(content: string | Array<string>, options?: MessageOptions): Promise<boolean>;
	public nuke(time?: number): this;
}

export class SkyraGuild extends KlasaGuild {
	public client: Skyra;
	public members: SkyraGuildMemberStore;
	public settings: GuildSettings;
	public moderation: ModerationManager;
	public security: GuildSecurity;
	public starboard: StarboardManager;
	public readonly nameDictionary: Collection<Snowflake, string>;
	public fetchName(id: Snowflake): Promise<string>;
}

export class SkyraUser extends KlasaUser {
	public client: Skyra;
	public settings: UserSettings;
}

export class GuildSettings extends Settings {
	// START OF GUILD SCHEMA
	_tags: Array<[string, string]>;
	channels: {
		announcement: Snowflake | null;
		default: Snowflake | null;
		log: Snowflake | null;
		messagelogs: Snowflake | null;
		modlog: Snowflake | null;
		roles: Snowflake | null;
		spam: Snowflake | null;
	};
	disabledChannels: Array<Snowflake>;
	disabledCommands: Array<string>;
	disabledCommandsChannels: { [k: string]: Array<string> };
	events: {
		banAdd: boolean;
		banRemove: boolean;
		commands: boolean;
		memberAdd: boolean;
		memberNicknameChange: boolean;
		memberRemove: boolean;
		memberRolesChange: boolean;
		messageDelete: boolean;
		messageEdit: boolean;
		messagePrune: boolean;
	};
	filter: {
		level: number;
		raw: Array<string>;
		regexp: RegExp | null;
	};
	language: string;
	messages: {
		farewell: string | null;
		greeting: string | null;
		'join-dm': string | null;
		warnings: boolean;
	};
	stickyRoles: Array<{ id: Snowflake, roles: Array<Snowflake> }>;
	prefix: string;
	roles: {
		admin: Snowflake | null;
		auto: Array<{ id: Snowflake, points: number }>;
		initial: Snowflake | null;
		messageReaction: Snowflake | null;
		moderator: Snowflake | null;
		muted: Snowflake | null;
		public: Array<Snowflake>;
		reactions: Array<{ emoji: string, role: Snowflake }>;
		removeInitial: boolean;
		staff: Snowflake | null;
		subscriber: Snowflake | null;
	};
	selfmod: {
		ignoreChannels: Array<Snowflake>;
		invitelinks: boolean;
		nmsthreshold: number;
		nomentionspam: boolean;
		raid: boolean;
		raidthreshold: number;
	};
	social: {
		achieve: boolean;
		achieveMessage: string | null;
		boost: number;
		monitorBoost: number;
	};
	starboard: {
		channel: Snowflake | null;
		ignoreChannels: Array<Snowflake>;
		minimum: number;
	};
	trigger: {
		alias: Array<{ input: string, output: string }>;
		includes: Array<{ action: 'react', input: string, output: string }>;
	};
	twitch: {
		channel: Snowflake | null;
		list: Array<string>;
		messagestart: string | null;
		messagestop: string | null;
		mode: number;
	};
	// END OF GUILD SCHEMA
	public tags: Collection<string, string>;
	public updateFilter(): void;
	public static superRegExp(filterArray: Array<string>): RegExp;
}

export class UserSettings extends Settings {
	// START OF USER SCHEMA
	public badgeList: Array<string>;
	public badgeSet: Array<string>;
	public bannerList: Array<string>;
	public bias: number;
	public color: string;
	public marry: Snowflake;
	public money: number;
	public points: number;
	public reputation: number;
	public themeLevel: string;
	public themeProfile: string;
	public timeDaily: number;
	public timeReputation: number;
	// END OF USER SCHEMA
	public readonly level: number;
	public win(money: number, guild: SkyraGuild): Promise<number>;
	public use(money: number): Promise<number>;
}

export class MemberSettings {
	public constructor(member: SkyraGuildMember);
	public readonly client: Skyra;
	public readonly guildID: string;
	public readonly userID: string;
	public readonly member: SkyraGuildMember;
	public count: number;
	private UUID: string;
	private _syncStatus: Promise<this> | null;

	public sync(): Promise<this>;
	public update(amount: number): Promise<this>;
	public destroy(): Promise<void>;
	public toJSON(): { count: number, guild: GuildEditData, member: GuildMemberEditData };
	public toString(): string;
	private _patch(data: { count?: number }): void;
	private _sync(): Promise<this>;
	private resolveData(entries: Array<{ [k: string]: any }>): { [k: string]: any };
}
