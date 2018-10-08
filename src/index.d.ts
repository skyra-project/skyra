//#region imports
import {
	Argument,
	Command,
	CommandOptions,
	CommandStore,
	Event,
	Extendable,
	Finalizer,
	Inhibitor,
	KlasaClient,
	KlasaClientOptions,
	KlasaConsoleColorObjects,
	KlasaGuild,
	KlasaMessage,
	KlasaTextChannel,
	KlasaUser,
	Language,
	Monitor,
	PermissionLevelOptions,
	PermissionLevels,
	Piece,
	Possible,
	Provider,
	Schema,
	Settings,
	Store,
	Task,
	Timestamp,
	util as KlasaUtil,
	ProviderStore,
	RichDisplay,
	ReactionHandler,
	RichDisplayRunOptions,
} from 'klasa';
import {
	BanOptions,
	Base64Resolvable,
	BufferResolvable,
	Channel,
	ClientUser,
	Collection,
	DataStore,
	DiscordAPIError,
	FetchMemberOptions,
	GuildEditData,
	GuildMember,
	GuildMemberEditData,
	GuildMemberResolvable,
	GuildMemberStore,
	GuildPruneMembersOptions,
	GuildResolvable,
	MessageEmbed,
	MessageOptions,
	Role,
	RoleData,
	Snowflake,
	TextChannel,
	UserResolvable,
	Util as DiscordUtil
} from 'discord.js';
import { Node, NodeMessage } from 'veza';
import { Image } from 'canvas-constructor';
import { Readable } from 'stream';
import { URL } from 'url';
import { R, MasterPool, WriteResult, TableChangeResult } from 'rethinkdb-ts';
//#endregion imports
//#region exports
export {
	ArgumentStore,
	Client,
	Colors,
	CommandPrompt,
	CommandStore,
	CommandUsage,
	Cron,
	Duration,
	EventStore,
	ExtendableStore,
	FinalizerStore,
	Gateway,
	GatewayDriver,
	GatewayStorage,
	InhibitorStore,
	KlasaClient,
	KlasaConsole,
	KlasaGuild,
	KlasaMessage,
	KlasaUser,
	LanguageStore,
	MonitorStore,
	Piece,
	Possible,
	QueryBuilder,
	ReactionHandler,
	RichDisplay,
	RichMenu,
	Schedule,
	ScheduledTask,
	Schema,
	SchemaFolder,
	SchemaPiece,
	Settings,
	Serializer,
	SerializerStore,
	SQLProvider,
	Stopwatch,
	Store,
	Tag,
	TaskStore,
	TextPrompt,
	Timestamp,
	Type,
	Usage
} from 'klasa';
export {
	Activity,
	Base,
	BaseClient,
	CategoryChannel,
	Channel,
	ChannelStore,
	ClientApplication,
	Collection,
	Collector,
	DataResolver,
	DataStore,
	DiscordAPIError,
	DMChannel,
	Emoji,
	GroupDMChannel,
	Guild,
	GuildAuditLogs,
	GuildChannel,
	GuildChannelStore,
	GuildEmoji,
	GuildEmojiRoleStore,
	GuildEmojiStore,
	GuildMember,
	GuildMemberRoleStore,
	GuildMemberStore,
	GuildStore,
	HTTPError,
	Invite,
	Message,
	MessageAttachment,
	MessageCollector,
	MessageMentions,
	MessageReaction,
	MessageStore,
	PermissionOverwrites,
	Permissions,
	Presence,
	PresenceStore,
	ReactionCollector,
	ReactionEmoji,
	ReactionUserStore,
	RichPresenceAssets,
	Role,
	RoleStore,
	Shard,
	ShardClientUtil,
	ShardingManager,
	Snowflake,
	SnowflakeUtil,
	Structures,
	TextChannel,
	User,
	UserStore,
	version,
	VoiceChannel,
	VoiceRegion,
	Webhook,
	WebhookClient
} from 'discord.js';
//#endregion exports

export const rootFolder: string;
export const assetsFolder: string;
export const config: SkyraConfiguration;

// @ts-ignore
export class Skyra extends KlasaClient {
	public constructor(options?: SkyraClientOptions);
	public options: SkyraClientOptions;
	public users: SkyraUserStore;
	public guilds: SkyraGuildStore;
	// @ts-ignore
	public providers: SkyraProviderStore;
	public user: SkyraClientUser;

	public version: string;
	public leaderboard: Leaderboard;
	public ipcPieces: APIStore;
	public rawEvents: RawEventStore;
	public ipc: Node;
	public usageStatus: {
		cpu: Array<number>;
		prc: Array<number>;
		ram: Array<number>;
		cmd: Array<number>;
	};
	public readonly timeoutManager: TimeoutManager;
	public readonly connectFour: ConnectFourManager;
	public readonly usernames: Collection<Snowflake, string>;
	public _updateStatsInterval: NodeJS.Timer;
	public _skyraReady: boolean;

	public fetchTag(id: Snowflake): Promise<string>;
	public fetchUsername(id: Snowflake): Promise<string>;
	public updateStats(): void;
	public dispose(): void;

	public static defaultPermissionLevels: SkyraPermissionLevels;
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
	private resolveData(entries: Array<ObjectLiteral>): ObjectLiteral;
}

export class StarboardManager extends Collection<Snowflake, StarboardMessage> {
	public constructor(guild: SkyraGuild);
	public client: Skyra;
	public guild: SkyraGuild;
	public readonly starboardChannel: KlasaTextChannel;
	public readonly minimum: number;
	public readonly provider: SkyraProvider;

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
	public readonly provider: SkyraProvider;
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
	public add(userID: Snowflake): Promise<void>;
	public remove(userID: Snowflake): Promise<void>;
	public edit(options: { starMessageID?: Snowflake, stars?: number, disabled?: boolean }): Promise<this>;
	public destroy(): Promise<void>;
	public toJSON(): { channelID: Snowflake, disabled: boolean, messageID: Snowflake, starMessageID: Snowflake | null, stars: number };
	public toString(): string;
	private _editMessage(): Promise<void>;
	private _syncDiscord(): Promise<void>;
	private _syncDatabase(): Promise<void>;

	public static COLORS: Array<number>;
}

export class UserRichDisplay extends RichDisplay {
	// @ts-ignore
	public run(message: KlasaMessage, target: Snowflake, options?: RichDisplayRunOptions): Promise<ReactionHandler>;
	public static displays: Map<string, ReactionHandler>;
}

export abstract class ModerationCommand extends SkyraCommand {
	public constructor(client: KlasaClient, store: CommandStore, file: string[], core: boolean, options?: ModerationCommandOptions);
	public modType: ModerationTypesEnum;
	public requiredMember: boolean;

	public run(msg: SkyraMessage, args: [Array<SkyraGuildMember>, string]): Promise<SkyraMessage>;
	protected prehandle(msg: SkyraMessage, users: Array<SkyraUser>, reason: string | null): Promise<any>;
	protected abstract handle(msg: SkyraMessage, user: SkyraUser, member: SkyraGuildMember | null, reason: string | null): Promise<ModerationManagerEntry>;
	protected posthandle(msg: SkyraMessage, users: Array<SkyraUser>, reason: string | null, prehandled: any): Promise<any>;
	protected checkModeratable(msg: SkyraMessage, target: SkyraUser): Promise<SkyraGuildMember>;
	protected sendModlog(msg: SkyraMessage, target: SkyraUser, reason: Array<string> | string, extraData?: any): Promise<ModerationManagerEntry>;
	public static types: ModerationTypeKeys;
}

export class WeebCommand extends SkyraCommand {
	public constructor(client: KlasaClient, store: CommandStore, file: string[], core: boolean, options?: WeebCommandOptions);
	public queryType: string;
	public responseName: string;
	public requiresUser: boolean;
	public url: URL;
	public run(msg: SkyraMessage, params: Array<SkyraUser>): Promise<SkyraMessage>;
}

export abstract class API extends Piece {
	// @ts-ignore
	public client: Skyra;
}

// @ts-ignore
export class APIStore extends Store<string, API, typeof API> {
	// @ts-ignore
	public client: Skyra;
	public run(message: NodeMessage): Promise<APIResponse>;
	public runPiece(piece: API, message: NodeMessage): Promise<APIResponse>;
}

export abstract class RawEvent extends Piece {
	// @ts-ignore
	public client: Skyra;
	public abstract process(): any;
}

// @ts-ignore
export class RawEventStore extends Store<string, RawEvent, typeof RawEvent> {
	// @ts-ignore
	public client: Skyra;
}

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

export class FuzzySearch<K, V> {
	constructor(collection: Collection<K, V>, access: (entry: V) => string, filter?: (entry: V) => boolean);
	public filter: (entry: V) => boolean;
	public access: (entry: V) => string;
	public run(msg: SkyraMessage, query: string): V;
}

export class LanguageHelp {
	constructor();
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
	public static user(data: SkyraUser): ToJSONUser;
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

declare class Util {
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
	public static announcementCheck(msg: SkyraMessage): Role;
	public static basicAuth(user: string, password: string): string;
	public static createMuteRole(msg: SkyraMessage): Promise<Role>;
	public static cutText(input: string, length: number): string;
	public static deIdiotify(error: DiscordAPIError): never;
	public static fetch(url: URL | string, options?: ObjectLiteral, type?: 'buffer'): Promise<Buffer>;
	public static fetch(url: URL | string, options?: ObjectLiteral, type?: 'text'): Promise<string>;
	public static fetch(url: URL | string, options?: ObjectLiteral, type?: string): Promise<any>;
	public static fetch(url: URL | string, type?: 'buffer'): Promise<Buffer>;
	public static fetch(url: URL | string, type?: 'text'): Promise<string>;
	public static fetch(url: URL | string, type?: string): Promise<any>;
	public static fetch<T = ObjectLiteral>(url: URL | string, options?: ObjectLiteral, type?: 'json'): Promise<T>;
	public static fetch<T = ObjectLiteral>(url: URL | string, type?: 'json'): Promise<T>;
	public static fetchAvatar(user: SkyraUser, size?: 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048): Promise<Buffer>;
	public static getContent(message: SkyraMessage): string | null;
	public static getImage(message: SkyraMessage): string | null;
	public static httpResponses(code: number): string;
	public static loadImage(path: string): Image;
	public static moderationCheck(msg: SkyraMessage, moderator: SkyraGuildMember, target: SkyraGuildMember): void;
	public static oneToTen(level: number): UtilOneToTenEntry;
	public static pick<T>(array: T[]): () => T;
	public static createReferPromise<T>(): { resolve: (value: T) => void, reject: (value: T) => void, promise: Promise<T> };
	public static removeMute(guild: SkyraGuild, member: Snowflake): Promise<boolean>;
	public static resolveEmoji(emoji: string | { name: string, id: Snowflake | null, animated: boolean }): string | null;
	public static splitText(input: string, length: number, char?: string): string;
	public static streamToBuffer(stream: Readable): Promise<Buffer>;
	private static _createMuteRolePush(channel: Channel, role: Role, array: Array<Snowflake>): Promise<any>;
}

export { Util as util };

export const rUnicodeEmoji: RegExp;
export function levenshtein(a: string, b: string, full?: boolean): number;

export class ConnectFour {
	public constructor(challenger: SkyraUser, challengee: SkyraUser);
	public client: Skyra;
	public challenger: SkyraUser;
	public challengee: SkyraUser;
	public message: SkyraMessage | null;
	public language: SkyraLanguage;
	public turn: 0 | 1;
	public table: Array<[number, number, number, number, number]>;
	public winner: SkyraUser | null;
	public collector: ((emoji: string, userID: Snowflake) => void) | null;
	public running: boolean;
	public readonly manager: ConnectFourManager;
	public readonly manageMessages: boolean;

	public run(message: SkyraMessage): Promise<void>;
	public dispose(): void;
	public send(emoji: string, userID: Snowflake): void;
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
	private removeEmoji(emoji: string, userID: Snowflake): Promise<void>;
	private _checkVerticals(posX: number, MIN_Y: number, MAX_Y: number, PLAYER: 1 | 2): ConnectFourWinningRow | null;
}

export class ConnectFourManager {
	public constructor(client: Skyra);
	public client: Skyra;
	public matches: Map<Snowflake, ConnectFour>;
	public has(channel: Snowflake): boolean;
	public delete(channel: Snowflake): boolean;
	public alloc(channel: Snowflake, challenger: SkyraUser, challengee: SkyraUser): (accept: boolean) => ConnectFour | null;
	public create(channel: Snowflake, challenger: SkyraUser, challengee: SkyraUser): ConnectFour;
	private _alloc(channel: Snowflake, challenger: SkyraUser, challengee: SkyraUser, accept: boolean): ConnectFour | null;
}

export class Slotmachine {
	public constructor(msg: SkyraMessage, amount: number);
	public player: SkyraUser;
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

export class TimeoutManager {
	constructor(client: Skyra);
	public client: Skyra;
	private cache: Array<RatelimitEntry>;
	private _interval: NodeJS.Timer | null;
	public next(): RatelimitEntry;
	public set(id: string, time: number, callback: () => void, rerun?: boolean): boolean;
	public get(id: string): RatelimitEntry;
	public has(id: string): boolean;
	public delete(id: string): boolean;
	public dispose(): void;
	public keys(): Iterable<string>;
	public values(): Iterable<RatelimitEntry>;
	public [Symbol.iterator](): Iterable<RatelimitEntry>;
	private _run(): void;
}

export class AntiRaid {
	public constructor(guild: SkyraGuild);
	public attack: boolean;
	public guild: SkyraGuild;
	private readonly guildSettings: GuildSettings;

	public add(member: SkyraGuildMember | Snowflake): this;
	public clear(): void;
	public delete(member: SkyraGuildMember | Snowflake): this;
	public execute(): Promise<Array<SkyraGuildMember>>;
	public has(member: SkyraGuildMember | Snowflake): this;
	public keys(): Iterable<string>;
	public kick(member: SkyraGuildMember): SkyraGuildMember;
	public members(): Iterable<Snowflake>;
	public prune(kick?: boolean): Promise<Array<SkyraGuildMember>>;
	public stop(): void;
}

export class GuildSecurity {
	public constructor(guild: SkyraGuild);
	public guild: SkyraGuild;
	public readonly raid: AntiRaid;
	public readonly nms: NoMentionSpam;
	public readonly lockdowns: Map<Snowflake, NodeJS.Timer>;

	public dispose(): void;
	public clearRaid(): void;
	public clearNMS(): void;
	public clearLockdowns(): void;
}

export class ModerationManager extends Collection<string, ModerationManagerEntry> {
	public constructor(guild: SkyraGuild);
	public guild: SkyraGuild;
	private _count: number | null;
	private _timer: NodeJS.Timer | null;
	public new: ModerationManagerEntry;
	private readonly pool: object;
	private readonly table: object;
	public createLock(): () => void;
	public releaseLock(): void;
	public waitLock(): Promise<Array<undefined>>;
	public fetch(caseID: number): Promise<ModerationManagerEntry>;
	public fetch(userID: Snowflake): Promise<Array<ModerationManagerEntry>>;
	public fetch(caseIDs: Array<number>): Promise<Array<ModerationManagerEntry>>;
	public fetch(): Promise<this>;
	public count(): Promise<number>;
	public update(data: ModerationManagerUpdateData): Promise<void>;
	public insert(data: ModerationManagerInsertData): Promise<ModerationManagerEntry>;
	public appeal(data: ModerationManagerAppealData): Promise<ModerationManagerEntry>;
}

export class ModerationManagerEntry {
	public case: number;
	public duration: number | null;
	public extraData: Array<any> | null;
	public guild: string;
	public id: string;
	public moderator: Snowflake | null;
	public readonly appealed: boolean;
	public readonly cacheExpired: boolean;
	public readonly cacheRemaining: number;
	public readonly name: string;
	public readonly temporary: boolean;
	public reason: string | null;
	public type: number;
	public user: Snowflake | null;
	private shouldSend: boolean;
	public appeal(): Promise<this>;
	public create(): Promise<this | null>;
	public edit(options: ModerationManagerUpdateData): Promise<this>;
	public prepareEmbed(): Promise<SkyraMessageEmbed>;
	public setCase(value: number): this;
	public setDuration(value: number | string): this;
	public setExtraData(value: object | string): this;
	public setModerator(value: SkyraUser | SkyraGuildMember | Snowflake): this;
	public setReason(value: string | Array<string>): this;
	public setType(value: ModerationTypesEnum | string): this;
	public setUser(value: SkyraUser | SkyraGuildMember | Snowflake): this;
	public toJSON(): ModerationLogJSON;
	public toString(): string;
	private static regexParse: RegExp;
	private static timestamp: Timestamp;
}

export class NoMentionSpam extends Map<Snowflake, NoMentionSpamEntry> {
	public get(userID: Snowflake, create?: boolean): NoMentionSpamEntry | null;
	public get(key: Snowflake): NoMentionSpamEntry;
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

export class RebirthDB extends SkyraProvider {
	public db: R;
	public pool: MasterPool | null;
	public create(table: string, id: string, value?: { [k: string]: any }): Promise<WriteResult>;
	public createTable(table: string): Promise<TableChangeResult>;
	public delete(table: string, id: string): Promise<WriteResult>;
	public deleteTable(table: string): Promise<TableChangeResult>;
	public get<T extends object>(table: string, id: string): Promise<T>;
	public getAll<T extends object>(table: string, entries?: Array<string>): Promise<Array<T>>;
	public getKeys(table: string, entries?: Array<string>): Promise<Array<string>>;
	public getRandom<T extends object>(table: string): Promise<T>;
	public has(table: string, id: string): Promise<boolean>;
	public hasTable(table: string): Promise<boolean>;
	public init(): Promise<void>;
	public ping(): Promise<number>;
	public replace(table: string, id: string, value?: { [k: string]: any }): Promise<WriteResult>;
	public sync(table: string): Promise<{ synced: number }>;
	public update(table: string, id: string, value?: { [k: string]: any }): Promise<WriteResult>;
}

//#region types

type SkyraClientOptions = {
	dev?: boolean;
} & KlasaClientOptions;

type ModerationTypesEnum =
	// BAN
	0b0000 |
	// KICK
	0b0001 |
	// MUTE
	0b0010 |
	// PRUNE
	0b0011 |
	// SOFT_BAN
	0b0100 |
	// VOICE_KICK
	0b0101 |
	// VOICE_MUTE
	0b0110 |
	// WARN
	0b0111 |
	// BAN & APPEALED
	0b010000 |
	// MUTE & APPEALED
	0b010010 |
	// VOICE_MUTE & APPEALED
	0b010101 |
	// WARN & APPEALED
	0b010111 |
	// BAN & TEMPORARY
	0b100000 |
	// MUTE & TEMPORARY
	0b100010 |
	// VOICE_MUTE & TEMPORARY
	0b100110;

type ModerationTypeKeys = {
	BAN: 0b0000;
	KICK: 0b0001;
	MUTE: 0b0010;
	PRUNE: 0b0011;
	SOFT_BAN: 0b0100;
	VOICE_KICK: 0b0101;
	VOICE_MUTE: 0b0110;
	WARN: 0b0111;
	UN_BAN: 0b010000;
	UN_MUTE: 0b010010;
	UN_VOICE_MUTE: 0b010101;
	UN_WARN: 0b010111;
	TEMPORARY_BAN: 0b100000;
	TEMPORARY_MUTE: 0b100010;
	TEMPORARY_VOICE_MUTE: 0b100110;
};

type NoMentionSpamEntry = {
	id: Snowflake;
	amount: number;
	timeout: NodeJS.Timer;
};

declare const ModerationSchemaKeysConstant: ModerationLogCacheEntryJSON;

interface ModerationLogJSON {
	[ModerationSchemaKeysConstant.CASE]: number | null;
	[ModerationSchemaKeysConstant.DURATION]: number | null;
	[ModerationSchemaKeysConstant.EXTRA_DATA]: any;
	[ModerationSchemaKeysConstant.GUILD]: Snowflake;
	[ModerationSchemaKeysConstant.MODERATOR]: Snowflake | null;
	[ModerationSchemaKeysConstant.REASON]: string | null;
	[ModerationSchemaKeysConstant.TYPE]: ModerationTypesEnum;
	[ModerationSchemaKeysConstant.USER]: Snowflake | null;
	[ModerationSchemaKeysConstant.CREATED_AT]: number;
}

type ModerationManagerTypeResolvable = ModerationTypesEnum | number;

type ModerationManagerUpdateData = {
	id?: string;
	[ModerationSchemaKeysConstant.DURATION]?: number | null;
	[ModerationSchemaKeysConstant.EXTRA_DATA]?: any;
	[ModerationSchemaKeysConstant.MODERATOR]?: Snowflake | null;
	[ModerationSchemaKeysConstant.REASON]?: string | null;
};

type ModerationManagerInsertData = {
	[ModerationSchemaKeysConstant.DURATION]: number | null;
	[ModerationSchemaKeysConstant.EXTRA_DATA]: any;
	[ModerationSchemaKeysConstant.MODERATOR]: Snowflake | null;
	[ModerationSchemaKeysConstant.REASON]: string | null;
	[ModerationSchemaKeysConstant.TYPE]: ModerationManagerTypeResolvable;
	[ModerationSchemaKeysConstant.USER]: Snowflake | null;
};

interface ModerationManagerAppealData {
	id?: string;
	[ModerationSchemaKeysConstant.CASE]?: number;
	[ModerationSchemaKeysConstant.USER]?: Snowflake;
}

type ConnectFourWinningRow = Array<{
	x: number;
	y: number;
}>;

type UtilOneToTenEntry = {
	emoji: string;
	color: number;
};

type RatelimitEntry = {
	id: string;
	time: number;
	callback: () => void;
};

type SkyraConstants = Readonly<{
	TIME: Readonly<{
		MILLISECOND: number;
		SECOND: number;
		MINUTE: number;
		HOUR: number;
		DAY: number;
		WEEK: number;
		YEAR: number;
	}>;
	EMOJIS: Readonly<{
		LOADING: string;
		SHINY: string;
		GREENTICK: string;
		REDCROSS: string;
	}>;
	CONNECT_FOUR: Readonly<{
		EMOJIS: Readonly<{
			1: string;
			2: string;
			0: string;
			WINNER_1: string;
			WINNER_2: string;
		}>;
		REACTIONS: ReadonlyArray<string>;
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
	MODERATION: Readonly<{
		TYPE_KEYS: Readonly<ModerationTypeKeys>;
		TYPE_ASSETS: Readonly<Record<ModerationTypesEnum, Readonly<{ color: number, title: string }>>>;
		SCHEMA_KEYS: Readonly<ModerationLogCacheEntryJSON>;
		ACTIONS: Readonly<{
			TEMPORARY: number;
			APPEALED: number;
		}>;
		ERRORS: Readonly<{
			CASE_APPEALED: string;
			CASE_NOT_EXISTS: string;
			CASE_TYPE_NOT_APPEAL: string;
		}>;
	}>;
}>;

type ModerationLogCacheEntryJSON = {
	CASE: 'caseID';
	DURATION: 'duration';
	EXTRA_DATA: 'extraData';
	GUILD: 'guildID';
	MODERATOR: 'moderatorID';
	REASON: 'reason';
	TYPE: 'type';
	USER: 'userID';
	CREATED_AT: 'createdAt';
};

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
	modType: ModerationTypesEnum;
	requiredMember?: boolean;
} & CommandOptions;

type SkyraConfiguration = {
	name: string;
	prefix: string;
	ownerID: string;
	version: string;
	database: {
		rethinkdb: {
			production: ObjectLiteral;
			development: ObjectLiteral;
		};
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

//#endregion types
//#region klasa

declare class SkyraPermissionLevels extends PermissionLevels {
	// @ts-ignore
	public add(level: number, check: (client: Skyra, message: SkyraMessage) => boolean, options?: PermissionLevelOptions): this;
}

export { SkyraPermissionLevels as PermissionLevels };

declare abstract class SkyraCommand extends Command {
	// @ts-ignore
	public client: Skyra;
	public createCustomResolver(type: string, resolver: (arg: string, possible: Possible, message: SkyraMessage, params: string[]) => any): this;
	public inhibit(msg: SkyraMessage): Promise<boolean>;
}

export { SkyraCommand as Command };

declare abstract class SkyraArgument extends Argument {
	// @ts-ignore
	public client: Skyra;
}

export { SkyraArgument as Argument };

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

declare abstract class SkyraTask extends Task {
	// @ts-ignore
	public client: Skyra;
}

export { SkyraTask as Task };

declare abstract class SkyraProviderStore extends ProviderStore {
	// @ts-ignore
	public client: Skyra;
	// @ts-ignore
	public default: RebirthDB;
}

export { SkyraProviderStore as ProviderStore };

//#endregion klasa
//#region discord.js

declare class SkyraClientUser extends ClientUser {
	public client: Skyra;
	public settings: UserSettings;
}

export { SkyraClientUser as ClientUser };

export class SkyraTextChannel extends KlasaTextChannel {
	public client: Skyra;
	public guild: SkyraGuild;
}

declare class SkyraMessageEmbed extends MessageEmbed {
	public splitFields(input: string | string[]): this;
}

export { SkyraMessageEmbed as MessageEmbed };

declare class SkyraUserStore extends DataStore<Snowflake, SkyraUser, typeof SkyraUser, UserResolvable> {
	constructor(client: Skyra, iterable?: Iterable<any>);
	public fetch(id: Snowflake, cache?: boolean): Promise<SkyraUser>;
}

declare class SkyraGuildStore extends DataStore<Snowflake, SkyraGuild, typeof SkyraGuild, GuildResolvable> {
	constructor(client: Skyra, iterable?: Iterable<any>);
	public create(name: string, options?: { region?: string, icon?: BufferResolvable | Base64Resolvable }): Promise<SkyraGuild>;
}

declare class SkyraGuildMemberStore extends DataStore<Snowflake, SkyraGuildMember, typeof SkyraGuildMember, GuildMemberResolvable> {
	constructor(guild: SkyraGuild, iterable?: Iterable<any>);
	public ban(user: UserResolvable, options?: BanOptions): Promise<SkyraGuildMember | SkyraUser | Snowflake>;
	public fetch(options: UserResolvable | FetchMemberOptions): Promise<SkyraGuildMember>;
	public fetch(): Promise<SkyraGuildMemberStore>;
	public fetch(options: FetchMemberOptions): Promise<Collection<Snowflake, SkyraGuildMember>>;
	public prune(options?: GuildPruneMembersOptions): Promise<number>;
	public unban(user: UserResolvable, reason?: string): Promise<SkyraUser>;
}

export class SkyraMessage extends KlasaMessage {
	public guildSettings: GuildSettings;
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
	public readonly memberSnowflakes: Set<Snowflake>;
	public readonly memberTags: Map<Snowflake, string>;
	public readonly memberUsernames: Map<Snowflake, string>;
}

export class SkyraUser extends KlasaUser {
	public client: Skyra;
	public settings: UserSettings;
}

export class SkyraGuildMember extends GuildMember {
	public client: Skyra;
	public settings: MemberSettings;
	public guild: SkyraGuild;
}

export class GuildSettings extends Settings {
	// START OF GUILD SCHEMA
	public tags: Array<[string, string]>;
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
		emoji: string | null;
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

//#endregion discord.js

export as namespace SKYRA;
