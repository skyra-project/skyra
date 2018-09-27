import {
	Collection,
	GuildEditData,
	GuildMemberEditData,
	MessageOptions,
	Snowflake,
	StringResolvable
} from 'discord.js';
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
	Task,
	Argument
} from 'klasa';
import rebirthdb from '../../providers/rebirthdb';
import Skyra from '../Skyra';
import ModerationManager from '../structures/ModerationManager';
import {
	MessageEmbed,
	SkyraGuildMember,
	SkyraGuildMemberStore,
	SkyraGuildChannelStore
} from './discord.js';

declare class SkyraPermissionLevels extends PermissionLevels {
	// @ts-ignore
	public add(level: number, check: (client: Skyra, message: SkyraMessage) => boolean, options?: PermissionLevelOptions): this;
}

export { SkyraPermissionLevels as PermissionLevels };

declare abstract class SkyraCommand extends Command {
	// @ts-ignore
	public client: Skyra;
	// @ts-ignore
	public createCustomResolver(type: string, resolver: (arg: string, possible: Possible, message: SkyraMessage, params: string[]) => any): this;
	public inhibit(msg: SkyraMessage): Promise<boolean>;
}

export { SkyraCommand as Command };

declare abstract class SkyraEvent extends Event {
	// @ts-ignore
	public client: Skyra;
}

export { SkyraEvent as Event };

declare abstract class SkyraExtendable extends Extendable {
	// @ts-ignore
	public client: Skyra;
}

export { SkyraExtendable as Extendable };

declare abstract class SkyraFinalizer extends Finalizer {
	// @ts-ignore
	public client: Skyra;
}

export { SkyraFinalizer as Finalizer };

declare abstract class SkyraInhibitor extends Inhibitor {
	// @ts-ignore
	public client: Skyra;
}

export { SkyraInhibitor as Inhibitor };

declare abstract class SkyraLanguage extends Language {
	// @ts-ignore
	public client: Skyra;
}

export { SkyraLanguage as Language };

declare abstract class SkyraMonitor extends Monitor {
	// @ts-ignore
	public client: Skyra;
}

export { SkyraMonitor as Monitor };

declare abstract class SkyraProvider extends Provider {
	// @ts-ignore
	public client: Skyra;
}

export { SkyraProvider as Provider };

declare abstract class SkyraProviderStore extends ProviderStore {
	// @ts-ignore
	public client: Skyra;
	public default: rebirthdb;
}

export { SkyraProviderStore as ProviderStore };

declare abstract class SkyraTask extends Task {
	// @ts-ignore
	public client: Skyra;
}

export { SkyraTask as Task };

declare abstract class SkyraArgument extends Argument {
	// @ts-ignore
	public client: Skyra;
	// @ts-ignore
	public abstract run(arg: string, possible: Possible, message: SkyraMessage): Promise<any>;
}

export { SkyraArgument as Argument };

export class SkyraMessage extends KlasaMessage {
	public guildSettings: GuildSettings;
	// @ts-ignore
	public guild: SkyraGuild;
	public alert(content: string | Array<string>, timer?: number): SkyraMessage;
	public alert(content: string | Array<string>, options?: MessageOptions, timer?: number): SkyraMessage;
	public ask(content: string | Array<string>, options?: MessageOptions): Promise<boolean>;
	public nuke(time?: number): this;

	// @ts-ignore
	public sendLocale(key: string, options?: MessageOptions): Promise<SkyraMessage | SkyraMessage[]>;
	// @ts-ignore
	public sendLocale(key: string, localeArgs?: Array<any>, options?: MessageOptions): Promise<SkyraMessage | SkyraMessage[]>;
	// @ts-ignore
	public sendMessage(content?: StringResolvable, options?: MessageOptions): Promise<SkyraMessage | SkyraMessage[]>;
	// @ts-ignore
	public sendEmbed(embed: MessageEmbed, content?: StringResolvable, options?: MessageOptions): Promise<SkyraMessage | SkyraMessage[]>;
	// @ts-ignore
	public sendCode(language: string, content: StringResolvable, options?: MessageOptions): Promise<SkyraMessage | SkyraMessage[]>;
	// @ts-ignore
	public send(content?: StringResolvable, options?: MessageOptions): Promise<SkyraMessage | SkyraMessage[]>;
}

export class SkyraGuild extends KlasaGuild {
	// @ts-ignore
	public channels: SkyraGuildChannelStore;
	// @ts-ignore
	public client: Skyra;
	// @ts-ignore
	public members: SkyraGuildMemberStore;
	public moderation: ModerationManager;
	public security: GuildSecurity;
	public settings: GuildSettings;
	public starboard: StarboardManager;
	public readonly nameDictionary: Collection<Snowflake, string>;
	public fetchName(id: Snowflake): Promise<string>;
}

export class SkyraUser extends KlasaUser {
	// @ts-ignore
	public client: Skyra;
	public settings: UserSettings;
}

export class GuildSettings extends Settings {
	// START OF GUILD SCHEMA
	public _tags: Array<[string, string]>;
	public channels: {
		announcement: Snowflake | null;
		default: Snowflake | null;
		log: Snowflake | null;
		messagelogs: Snowflake | null;
		modlog: Snowflake | null;
		roles: Snowflake | null;
		spam: Snowflake | null;
	};
	public disabledChannels: Array<Snowflake>;
	public disabledCommands: Array<string>;
	public disabledCommandsChannels: { [k: string]: Array<string> };
	public events: {
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
	public filter: {
		level: number;
		raw: Array<string>;
		regexp: RegExp | null;
	};
	public language: string;
	public messages: {
		farewell: string | null;
		greeting: string | null;
		'join-dm': string | null;
		warnings: boolean;
	};
	public stickyRoles: Array<{ id: Snowflake, roles: Array<Snowflake> }>;
	public prefix: string;
	public roles: {
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
	public selfmod: {
		ignoreChannels: Array<Snowflake>;
		invitelinks: boolean;
		nmsthreshold: number;
		nomentionspam: boolean;
		raid: boolean;
		raidthreshold: number;
	};
	public social: {
		achieve: boolean;
		achieveMessage: string | null;
		boost: number;
		monitorBoost: number;
	};
	public starboard: {
		channel: Snowflake | null;
		ignoreChannels: Array<Snowflake>;
		minimum: number;
	};
	public trigger: {
		alias: Array<{ input: string, output: string }>;
		includes: Array<{ action: 'react', input: string, output: string }>;
	};
	public twitch: {
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
