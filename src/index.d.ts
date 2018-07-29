import {
	Command,
	CommandOptions,
	Configuration,
	KlasaClient,
	KlasaConsoleColorObjects,
	KlasaGuild,
	KlasaMessage,
	KlasaTextChannel,
	KlasaUser,
	Language,
	Piece,
	Provider,
	Store,
	Timestamp,
	util as KlasaUtil,
	CommandStore
} from 'klasa';
import {
	Channel,
	Collection,
	DiscordAPIError,
	GuildMember,
	MessageEmbed,
	MessageOptions,
	RoleData,
	Snowflake,
	TextChannel,
	Util as DiscordUtil,
	Role,
	GuildEditData,
	GuildMemberEditData
} from 'discord.js';
import {
	Node,
	NodeMessage
} from 'veza';
import {
	Image
} from 'canvas-constructor';

export * from 'klasa';
export * from 'discord.js';

export const rootFolder: string;
export const assetsFolder: string;
export const config: SkyraConfiguration;

export class Skyra extends KlasaClient {
	public version: string;
	public leaderboard: Leaderboard;
	public moderation: Moderation;
	public ipcPieces: APIStore;
	public rawEvents: RawEventStore;
	public ipc: Node;
	public dictionaryName: Map<Snowflake, string>;
	public usageStatus: {
		cpu: Array<number>;
		prc: Array<number>;
		ram: Array<number>;
		cmd: Array<number>;
	};
	public readonly connectFour: ConnectFourManager;
	private _updateStatsInterval: NodeJS.Timer;
	private _skyraReady: boolean;

	public fetchUserName(id: Snowflake): Promise<string>;
	public updateStats(): void;
	public dispose(): void;
}

declare class SkyraMessage extends KlasaMessage {
	public guildConfigs: GuildConfiguration;
	public guild: SkyraGuild | null;
	public alert(content: string | Array<string>, timer?: number): SkyraMessage;
	public alert(content: string | Array<string>, options?: MessageOptions, timer?: number): SkyraMessage;
	public ask(content: string | Array<string>, options?: MessageOptions): Promise<boolean>;
	public nuke(time?: number): this;
}

export class SkyraGuild extends KlasaGuild {
	public configs: GuildConfiguration;
	public security: GuildSecurity;
	public starboard: StarboardManager;
}

export class SkyraGuildMember extends GuildMember {
	public configs: MemberConfiguration;
	public guild: SkyraGuild;
}

export class GuildConfiguration extends Configuration {
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

export class MemberConfiguration {
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
	private resolveData(entries: Array<ObjectLiteral>): ObjectLiteral;
}

export class UserConfiguration extends Configuration {
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

export class StarboardManager extends Collection<Snowflake, StarboardMessage> {
	public constructor(guild: SkyraGuild);
	public client: Skyra;
	public guild: SkyraGuild;
	public readonly starboardChannel: KlasaTextChannel;
	public readonly minimum: number;
	public readonly provider: Provider;

	public dispose(): void;
	public fetch(channel: KlasaTextChannel, messageID: Snowflake, userID: Snowflake): Promise<StarboardMessage | null>;
}

export class StarboardMessage {
	public constructor(manager: StarboardManager, message: SkyraMessage);
	public manager: StarboardManager;
	public channel: KlasaTextChannel;
	public message: SkyraMessage;
	public disabled: boolean;
	public users: Set<Snowflake>;
	public readonly client: Skyra;
	public readonly provider: Provider;
	public readonly emoji: '⭐' | '🌟' | '💫' | '✨';
	public readonly color: number;
	public readonly embed: MessageEmbed;
	public readonly stars: number;
	private starMessage: SkyraMessage | null;
	private UUID: string | null;
	private _syncStatus: Promise<this> | null;
	private _lastUpdated: number;

	public sync(): Promise<this>;
	public disable(): Promise<boolean>;
	public enable(): Promise<boolean>;
	public add(userID: Snowflake): Promise<boolean>;
	public remove(userID: Snowflake): Promise<boolean>;
	public fetchStars(): Promise<number>;
	public updateMessage(): Promise<boolean>;
	public setStars(): Promise<boolean>;
	public destroy(): void;
	public dispose(): void;
	public toJSON(): { channelID: Snowflake, disabled: boolean, messageID: Snowflake, starMessageID: Snowflake | null, stars: number };
	public toString(): string;
	private _updateDatabase(object: ObjectLiteral): Promise<void>;
	private _sync(): Promise<this>;
	private _fetchUsers(): Promise<ObjectLiteral>;

	public static COLORS: Array<number>;
}

export class ModerationCommand extends Command {
	public constructor(client: KlasaClient, store: CommandStore, file: string[], core: boolean, options?: ModerationCommandOptions);
	public avoidAnonymous: boolean;
	public modType: string;
	public requiredMember: boolean;

	public checkModeratable(msg: SkyraMessage, target: KlasaUser): Promise<SkyraGuildMember>;
	public fetchTargetMember(msg: SkyraMessage, id: Snowflake, throwError: boolean): Promise<SkyraGuildMember | null>;
	public sendModlog(msg: SkyraMessage, target: KlasaUser, reason: Array<string> | string, extraData?: any): Promise<ModerationLog>;
	public static types: ModerationTypeKeys;
}

export class WeebCommand extends Command {
	public constructor(client: KlasaClient, store: CommandStore, file: string[], core: boolean, options?: WeebCommandOptions);
	public queryType: string;
	public responseName: string;
	public requiresUser: boolean;
	public url: URL;
	public run(msg: SkyraMessage, params: Array<KlasaUser>): Promise<SkyraMessage>;
}

export abstract class API extends Piece { }

export class APIStore extends Store<string, API, typeof API> {
	public run(message: NodeMessage): Promise<APIResponse>;
	public runPiece(piece: API, message: NodeMessage): Promise<APIResponse>;
}

export abstract class RawEvent extends Piece {
	public abstract process(): any;
}

export class RawEventStore extends Store<string, RawEvent, typeof RawEvent> { }

export class Color {
	public static parse(input: string): ColorOutput;
	public static generateHexadecimal(): string;
	public static generateBetween(max: number, min: number): number;
	public static luminance(r: number, g: number, b: number): number;
	public static hexConcat(r: number, g: number, b: number): string;
	private static _generateRandom(): ColorOutput;
	private static _HEX(input: string): ColorOutput;
	private static _RGB(input: string): ColorOutput;
	private static _HSL(input: string): ColorOutput;
	private static _B10(input: string): ColorOutput;

	public static Resolver: {
		B10: B10;
		HEX: HEX;
		HSL: HSL;
		RGB: RGB;
	};
}

export class FriendlyDuration {
	private static _dateFormats: Map<string, Intl.DateTimeFormat>;
	public static formatDate(date: Date | number, language: string): string;
	public static duration(duration: number, assets: DurationFormatAssetsTime): string;
	private static _addUnit(time: number, unit: DurationFormatAssetsUnit): string;
	private static _parse(duration: number): Array<number>;
	private static _parseUnit(time: number, unit: string): number;
}

export class LanguageHelp {
	public constructor();
	public explainedUsage: string | null;
	public possibleFormats: string | null;
	public examples: string | null;
	public reminder: string | null;
	public setExplainedUsage(text: string): this;
	public setPossibleFormats(text: string): this;
	public setExamples(text: string): this;
	public setReminder(text: string): this;
	public display(name: string, options: LanguageHelpDisplayOptions, multiline?: boolean): string;
	private static resolveMultilineString(input: string | Array<string>, multiline?: boolean): string;
}

export class Leaderboard {
	public constructor(client: Skyra);
	public client: Skyra;
	public users: Collection<Snowflake, LeaderboardUser>;
	public guilds: Collection<Snowflake, Collection<Snowflake, LeaderboardUser>>;
	public timeouts: LeaderboardTimeouts;
	private _tempPromises: LeaderboardPromises;

	public getMembers(guild: Snowflake): Promise<Collection<Snowflake, LeaderboardUser>>;
	public getUsers(): Promise<Collection<Snowflake, LeaderboardUser>>;
	public syncMembers(guild: Snowflake): Promise<void>;
	public syncUsers(): Promise<void>;
	public dispose(): void;
	public clearGuilds(): void;
	public clearUsers(): void;
	private _syncMembers(guild: Snowflake): Promise<void>;
	private _syncUsers(): Promise<void>;
}

export class PreciseTimeout {
	public constructor(time: number);
	public endsAt: number;
	public stopped: boolean;
	private resolve: Function | null;
	private timeout: NodeJS.Timer | null;
	public run(): Promise<boolean>;
	public stop(): boolean;
}

export class PromptList {
	public constructor(entries: PromptListResolvable);
	public entries: Array<string>;
	public run(msg: SkyraMessage, options?: PromptListOptions): Promise<number>;
	public static run(msg: SkyraMessage, entries: PromptListResolvable, options?: PromptListOptions, resolved?: boolean): Promise<number>;
	private static _run(msg: SkyraMessage, list: Array<string>, options: PromptListOptions): Promise<number>;
	private static _resolveData(data: PromptListResolvable): Array<string>;
}

export class ToJSON {
	public static user(data: KlasaUser): ToJSONUser;
	public static guildMember(data: SkyraGuildMember): ToJSONMember;
	public static guild(data: SkyraGuild): ToJSONGuild;
	public static role(data: Role): ToJSONRole;
	public static channel(data: Channel): ToJSONChannel;
}

export class DatabaseInit {
	public static init(r: any): Promise<void>;
	public static initBanners(r: any): Promise<void>;
	public static initStarboard(r: any): Promise<void>;
	public static initLocalScores(r: any): Promise<void>;
	public static initModeration(r: any): Promise<void>;
}

export const constants: SkyraConstants;

export class Util {
	public static MUTE_ROLE_PERMISSIONS: Readonly<{
		text: { SEND_MESSAGES: boolean, ADD_REACTIONS: boolean };
		voice: { CONNECT: false };
	}>;
	public static MUTE_ROLE_OPTIONS: Readonly<{
		reason: string;
		data: RoleData;
	}>;
	public static ONE_TO_TEN: Readonly<{
		0: UtilOneToTenEntry;
		1: UtilOneToTenEntry;
		2: UtilOneToTenEntry;
		3: UtilOneToTenEntry;
		4: UtilOneToTenEntry;
		5: UtilOneToTenEntry;
		6: UtilOneToTenEntry;
		7: UtilOneToTenEntry;
		8: UtilOneToTenEntry;
		9: UtilOneToTenEntry;
		10: UtilOneToTenEntry;
	}>;
	public static IMAGE_EXTENSION: RegExp;
	public static loadImage(path: string): Image;
	public static announcementCheck(msg: SkyraMessage): Role;
	public static removeMute(guild: SkyraGuild, member: Snowflake): Promise<boolean>;
	public static moderationCheck(msg: SkyraMessage, moderator: SkyraGuildMember, target: SkyraGuildMember): void;
	public static fetchModlog(guild: SkyraGuild, caseID: number): Promise<ModerationLog | null>;
	public static parseModlog(client: Skyra, guild: SkyraGuild, modlog: ModerationCaseData): Promise<ModerationLog>;
	public static deIdiotify(error: DiscordAPIError): never;
	public static oneToTen(level: number): UtilOneToTenEntry;
	public static basicAuth(user: string, password: string): string;
	public static httpResponses(code: number): string;
	public static splitText(input: string, length: number, char?: string): string;
	public static cutText(input: string, length: number): string;
	public static fetchAvatar(user: KlasaUser, size?: 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048): Promise<Buffer>;
	public static fetch<T = ObjectLiteral>(url: URL | string, type?: 'json'): Promise<T>;
	public static fetch<T = ObjectLiteral>(url: URL | string, options?: ObjectLiteral, type?: 'json'): Promise<T>;
	public static fetch(url: URL | string, type?: 'buffer'): Promise<Buffer>;
	public static fetch(url: URL | string, options?: ObjectLiteral, type?: 'buffer'): Promise<Buffer>;
	public static fetch(url: URL | string, type?: 'text'): Promise<string>;
	public static fetch(url: URL | string, options?: ObjectLiteral, type?: 'text'): Promise<string>;
	public static fetch(url: URL | string, options?: ObjectLiteral, type?: string): Promise<any>;
	public static getContent(message: SkyraMessage): string | null;
	public static getImage(message: SkyraMessage): string | null;
	public static createMuteRole(msg: SkyraMessage): Promise<Role>;
	private static _createMuteRolePush(channel: Channel, role: Role, array: Array<Snowflake>): Promise<any>;
}

export class ConnectFour {
	public constructor(challenger: KlasaUser, challengee: KlasaUser);
	public client: Skyra;
	public challenger: KlasaUser;
	public challengee: KlasaUser;
	public message: SkyraMessage | null;
	public language: Language;
	public turn: 0 | 1;
	public table: Array<[number, number, number, number, number]>;
	public winner: KlasaUser | null;
	public collector: ((emoji: string, userID: Snowflake) => void) | null;
	public running: boolean;
	public readonly manager: ConnectFourManager;
	public readonly manageMessages: boolean;

	public run(message: SkyraMessage): Promise<void>;
	public dispose(): void;
	private showWinner(row: ConnectFourWinningRow): void;
	private getRow(): Promise<ConnectFourWinningRow | null>;
	private pushLine(row: number): ConnectFourWinningRow | null;
	private isFullGame(): boolean;
	private isFUllLine(row: number): boolean;
	private check(posX: number, posY: number): ConnectFourWinningRow | null;
	private _check(posX: number, posY: number): ConnectFourWinningRow | null;
	private render(error?: number): string;
	private renderTable(): string;
	private switch(): void;
	private send(emoji: string, userID: Snowflake): void;
	private removeEmoji(emoji: string, userID: Snowflake): Promise<void>;
	private _checkVerticals(posX: number, MIN_Y: number, MAX_Y: number, PLAYER: 1 | 2): ConnectFourWinningRow | null;
}

export class ConnectFourManager {
	public constructor(client: Skyra);
	public client: Skyra;
	public matches: Map<Snowflake, ConnectFour>;
	public has(channel: Snowflake): boolean;
	public delete(channel: Snowflake): boolean;
	public alloc(channel: Snowflake, challenger: KlasaUser, challengee: KlasaUser): (accept: boolean) => ConnectFour | null;
	public create(channel: Snowflake, challenger: KlasaUser, challengee: KlasaUser): ConnectFour;
	private _alloc(channel: Snowflake, challenger: KlasaUser, challengee: KlasaUser, accept: boolean): ConnectFour | null;
}

export class Slotmachine {
	public constructor(msg: SkyraMessage, amount: number);
	public player: KlasaUser;
	public boost: number;
	public winnnings: number;
	public amount: number;

	public run(): Promise<Buffer>;
	private render(rolls: Array<number>): Promise<Buffer>;
	private calculate(roll: Array<number>): void;
	private roll(): Array<number>;
	private _spinReel(reel: number): number;

	public static images: {
		ICON: Image | null;
		SHINY: Image | null;
	};
	public static init(): Promise<void>;
}

export class AntiRaid extends Map<Snowflake, NodeJS.Timer> {
	public constructor(guild: SkyraGuild);
	public guild: SkyraGuild;
	public attack: boolean;
	private _timeout: NodeJS.Timer;
	private readonly guildConfigs: GuildConfiguration;

	public add(member: SkyraGuildMember | Snowflake): this;
	public delete(member: SkyraGuildMember | Snowflake): this;
	public delete(member: Snowflake): boolean;
	public execute(): Promise<Array<SkyraGuildMember>>;
	public stop(): void;
	public clear(): void;
	public kick(member: SkyraGuildMember): SkyraGuildMember;
	public prune(kick?: boolean): Promise<Array<SkyraGuildMember>>;
}

export class GuildSecurity {
	public constructor(guild: SkyraGuild);
	public guild: SkyraGuild;
	public readonly raid: AntiRaid;
	public readonly nms: NoMentionSpam;
	public readonly lockdowns: Map<Snowflake, NodeJS.Timer>;
	private _raid: AntiRaid | null;
	private _nms: NoMentionSpam | null;
	private _lockdowns: Map<Snowflake, NodeJS.Timer> | null;

	public hasLockdown(channel: Snowflake): boolean;
	public hasRAID(user: Snowflake): boolean;
	public dispose(): void;
	public clearRaid(): void;
	public clearNMS(): void;
	public clearLockdowns(): void;
}

export class Moderation {
	public constructor(client: Skyra);
	public client: Skyra;
	public _temp: Map<Snowflake, string>;
	public readonly r: any;
	public addCase(guild: SkyraGuild, data: ModerationCaseData): Promise<boolean>;
	public getCase(guildID: Snowflake, caseID: number): Promise<ModerationCaseData>;
	public updateCase(guild: SkyraGuild, data: ModerationCaseData): Promise<boolean>;
	public appealCase(guild: SkyraGuild, data?: ModerationCaseData): Promise<ModerationCaseData>;
	public getCases(guild: SkyraGuild, data?: ModerationCaseData): Promise<Array<ModerationCaseData>>;
	public getLastCase(guild: SkyraGuild, data?: ModerationCaseData): Promise<ModerationCaseData>;
	public getAmountCases(guild: SkyraGuild, type: string): Promise<number>;
	private _checkGuild(guild: SkyraGuild | Snowflake): Snowflake;

	public static typeKeys: ModerationTypeKeys;
	public static schemaKeys: ModerationSchemaKeys;
	public static errors: ModerationErrors;
}

export class ModerationLog {
	public constructor(guild: SkyraGuild);
	public client: Skyra;
	public guild: SkyraGuild;
	public moderator: KlasaUser | null;
	public user: KlasaUser | null;
	public type: ModerationTypesEnum | null;
	public reason: string | null;
	public duration: number | null;
	public caseNumber: number | null;
	public extraData: any;
	public readonly embed: MessageEmbed;
	public readonly description: string;
	public readonly accurateType: ModerationTypesEnum;
	public readonly channel: TextChannel | null;
	public readonly appealType: 'unban' | 'unmute' | 'vunmute' | null;
	public readonly appeal: boolean;

	public setCaseNumber(value: number): this;
	public setModerator(value: KlasaUser): this;
	public setUser(value: KlasaUser): this;
	public setType(value: ModerationTypesEnum): this;
	public setReason(value: Array<string> | string): this;
	public setDuration(value: string | number): this;
	public setExtraData(value: any): this;
	public avoidAnonymous(): this;
	public send(): Promise<this>;
	public toJSON(): ModerationLogJSON;
	public toString(): string;
	private _fetchCaseNumber(): Promise<this>;
	private _shouldSend(data: ModerationLogCacheEntry): boolean;
	private _parseReason(): this;

	public static TYPES: Readonly<{ [k in ModerationTypesEnum]: { color: number, title: string } }>;
	public static timestamp: Timestamp;
	public static regexParse: RegExp;
	private static cache: Map<KlasaUser, ModerationLogCacheEntry>;
	private static create(guild: SkyraGuild, log: ModerationLogJSON): ModerationLog;
}

export class NoMentionSpam extends Map<Snowflake, NoMentionSpamEntry> {
	public get(userID: Snowflake, create?: boolean): NoMentionSpamEntry | null;
	public add(userID: Snowflake, amount: number): number;
	public delete(userID: Snowflake): void;
	public delete(key: Snowflake): boolean;
	public clear(): void;
	private _timeout(entry: NoMentionSpamEntry): void;
}

export { KlasaUtil as klasaUtil };
export { DiscordUtil as discordUtil };

export const versions: {
	skyra: string;
	klasa: string;
	discord: string;
};

type ModerationLogCacheEntry = {
	type: ModerationTypesEnum;
	timeout: NodeJS.Timer;
};

type ModerationTypesEnum = 'ban' | 'kick' | 'mute' | 'prune' | 'softban' | 'tban' | 'tmute' | 'tvmute' | 'unban' | 'unmute' | 'unwarn' | 'unvmute' | 'vkick' | 'vmute' | 'warn';

type NoMentionSpamEntry = {
	id: Snowflake;
	amount: number;
	timeout: NodeJS.Timer;
};

type ModerationErrors = Readonly<{
	CASE_NOT_EXISTS: 'CASE_NOT_EXISTS';
	CASE_APPEALED: 'CASE_APPEALED';
	CASE_TYPE_NOT_APPEAL: 'CASE_TYPE_NOT_APPEAL';
}>;

interface ModerationSchemaKeys {
	readonly APPEAL: 'appeal';
	readonly CASE: 'caseID';
	readonly DURATION: 'duration';
	readonly EXTRA_DATA: 'extraData';
	readonly GUILD: 'guildID';
	readonly MODERATOR: 'moderatorID';
	readonly REASON: 'reason';
	readonly TIMED: 'timed';
	readonly TYPE: 'type';
	readonly USER: 'userID';
}

declare const ModerationSchemaKeysConstant: ModerationSchemaKeys;

interface ModerationLogJSON {
	[ModerationSchemaKeysConstant.APPEAL]: boolean;
	[ModerationSchemaKeysConstant.CASE]: number | null;
	[ModerationSchemaKeysConstant.DURATION]: number | null;
	[ModerationSchemaKeysConstant.EXTRA_DATA]: any;
	[ModerationSchemaKeysConstant.GUILD]: Snowflake;
	[ModerationSchemaKeysConstant.MODERATOR]: Snowflake | null;
	[ModerationSchemaKeysConstant.REASON]: string | null;
	[ModerationSchemaKeysConstant.TIMED]: boolean;
	[ModerationSchemaKeysConstant.TYPE]: ModerationTypesEnum;
	[ModerationSchemaKeysConstant.USER]: Snowflake | null;
}

type ModerationTypeKeys = Readonly<{
	BAN: 'ban';
	SOFT_BAN: 'softban';
	KICK: 'kick';
	VOICE_KICK: 'vkick';
	MUTE: 'mute';
	VOICE_MUTE: 'vmute';
	WARN: 'warn';
	PRUNE: 'prune';
	TEMPORARY_BAN: 'tban';
	TEMPORARY_MUTE: 'tmute';
	TEMPORARY_VOICE_MUTE: 'tvmute';
	UN_BAN: 'unban';
	UN_MUTE: 'unmute';
	UN_VOICE_MUTE: 'unvmute';
	UN_WARN: 'unwarn';
}>;

type ModerationCaseData = {
	guildID: Snowflake;
	moderatorID?: Snowflake;
	userID: Snowflake;
	type: ModerationTypesEnum;
	reason?: string;
	caseID: number;
	duration?: number;
	timed?: boolean;
	appeal?: boolean;
	extraData?: any;
};

type ConnectFourWinningRow = Array<{
	x: number;
	y: number;
}>;

type UtilOneToTenEntry = {
	emoji: string;
	color: number;
};

type SkyraConstants = Readonly<{
	TIME: Readonly<{
		MILLISECOND: number;
		SECOND: number;
		MINUTE: number;
		HOUR: number;
		DAY: number;
	}>;
	EMOJIS: Readonly<{
		SHINY: string;
	}>;
	CONNECT_FOUR: Readonly<{
		EMOJIS: Readonly<{
			1: string;
			2: string;
			0: string;
			WINNER_1: string;
			WINNER_2: string;
		}>;
		REACTIONS: Readonly<Array<string>>;
		REACTION_OPTIONS: Readonly<{
			time: number;
			max: number;
		}>;
		RESPONSES: Readonly<{
			FULL_LINE: 0;
			FULL_GAME: 1;
			TIMEOUT: 2;
		}>;
	}>;
	MESSAGE_LOGS: Readonly<{
		kMessage: symbol;
		kNSFWMessage: symbol;
		kModeration: symbol;
		kMember: symbol;
	}>;
}>;

type ToJSONChannel = {
	id: Snowflake;
	type: 'text' | 'voice' | 'dm' | 'group' | 'category';
	createdTimestamp: number;
	name?: string;
	nsfw?: boolean;
	position?: number;
	permissions?: number;
};

type ToJSONRole = {
	id: Snowflake,
	name: string;
	createdTimestamp: number;
	color: string;
	hoist: boolean;
	permissions: number;
	position: number;
};

type ToJSONGuild = {
	id: Snowflake,
	name: string;
	available: boolean;
	features: Array<string>;
	icon: string;
	memberCount: number;
	ownerID: Snowflake;
	region: string;
	verificationLevel: number;
	verified: boolean;
	roles: Array<ToJSONRole>;
	createdTimestamp: number;
};

type ToJSONMember = {
	id: Snowflake;
	user: ToJSONUser;
	nickname: string | null;
	roles: Array<ToJSONRole>;
	kickable: boolean;
	bannable: boolean;
	manageable: boolean;
	color: string;
	joinedTimestamp: number;
};

type ToJSONUser = {
	id: Snowflake;
	username: string;
	discriminator: string;
	avatar: string;
	bot: boolean;
	createdTimestamp: number;
};

type PromptListResolvable = Array<string | [string, string]> | Map<string, string> | Set<string> | Iterable<string>;

type PromptListOptions = {
	maxAttempts?: number;
	listMode?: boolean;
};

type LeaderboardUser = {
	name: string | null;
	points: number;
	position: number;
};

type LeaderboardTimeouts = {
	users?: PreciseTimeout;
	guilds: Collection<Snowflake, PreciseTimeout>;
};

type LeaderboardPromises = {
	users?: Promise<void>;
	guilds: Collection<Snowflake, Promise<void>>;
};

type LanguageHelpDisplayOptions = {
	extendedHelp?: Array<string> | string;
	explainedUsage?: Array<[string, string]>;
	possibleFormats?: Array<[string, string]>;
	examples?: Array<string>;
	reminder?: Array<string> | string;
};

type DurationFormatAssetsTime = {
	WEEK: DurationFormatAssetsUnit;
	DAY: DurationFormatAssetsUnit;
	HOUR: DurationFormatAssetsUnit;
	MINUTE: DurationFormatAssetsUnit;
	SECOND: DurationFormatAssetsUnit;
};

type DurationFormatAssetsUnit = {
	1?: string;
	2?: string;
	3?: string;
	4?: string;
	5?: string;
	6?: string;
	7?: string;
	8?: string;
	9?: string;
	10?: string;
	11?: string;
	12?: string;
	13?: string;
	14?: string;
	15?: string;
	16?: string;
	17?: string;
	18?: string;
	19?: string;
	20?: string;
	21?: string;
	22?: string;
	23?: string;
	24?: string;
	25?: string;
	26?: string;
	27?: string;
	28?: string;
	29?: string;
	30?: string;
	31?: string;
	DEFAULT: string;
};

declare class B10 {
	public constructor(value: number);
	public value: number;
	public readonly hex: HEX;
	public readonly rgb: RGB;
	public readonly hsl: HSL;
	public readonly b10: B10;
	public valid(): boolean;
	public toString(): string;
}

declare class HEX {
	public constructor(r: string, g: string, b: string);
	public r: string;
	public g: string;
	public b: string;
	public readonly hex: HEX;
	public readonly rgb: RGB;
	public readonly hsl: HSL;
	public readonly b10: B10;
	public valid(): boolean;
	public toString(): string;
}

declare class HSL {
	public constructor(h: number, s: number, l: number);
	public h: number;
	public s: number;
	public l: number;
	public readonly hex: HEX;
	public readonly rgb: RGB;
	public readonly hsl: HSL;
	public readonly b10: B10;
	public valid(): boolean;
	public toString(): string;
	public static hue2rgb(p: number, q: number, t: number): number;
}

declare class RGB {
	public constructor(r: number, g: number, b: number);
	public r: number;
	public g: number;
	public b: number;
	public readonly hex: HEX;
	public readonly rgb: RGB;
	public readonly hsl: HSL;
	public readonly b10: B10;
	public valid(): boolean;
	public toString(): string;
}

type ColorOutput = {
	readonly hex: HEX;
	readonly rgb: RGB;
	readonly hsl: HSL;
	readonly b10: B10;
};

type APIResponse = {
	success: boolean;
	response: any;
	type: string;
	code: number;
};

type WeebCommandOptions = {
	queryType: string;
	responseName: string;
} & CommandOptions;

type ModerationCommandOptions = {
	avoidAnonymous?: boolean;
	modType: string;
	requiredMember?: boolean;
} & CommandOptions;

type SkyraConfiguration = {
	name: string;
	prefix: string;
	ownerID: string;
	version: string;
	database: {
		rethinkdb: ObjectLiteral;
		[k: string]: ObjectLiteral;
	};
	api: {
		allowedSocialTokens: Array<string>;
	};
	console: {
		utc: boolean;
		useColor: boolean;
		colors: ObjectLiteral<KlasaConsoleColorObjects>;
	};
	tokens: ObjectLiteral;
	dash: {
		session: {
			secret: string;
			resave: boolean;
			saveUnitialized: boolean;
		};
		oauthSecret: string;
		callback: string;
		port: string;
		domain: string;
		privateAuth: string;
		secretAuth: string;
	};
};

type ObjectLiteral<T = any> = {
	[k: string]: T;
};
