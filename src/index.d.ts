import { KlasaClient, KlasaConsoleColorObjects, KlasaGuild, Configuration, KlasaTextChannel, Provider, KlasaMessage, Command, CommandOptions, KlasaUser, Piece, Store } from 'klasa';
import { Snowflake, GuildMember, Collection, MessageEmbed } from 'discord.js';
import { Node, NodeMessage } from 'veza';

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
	}
	public readonly connectFour: ConnectFourManager;
	private _updateStatsInterval: NodeJS.Timer;
	private _skyraReady: boolean;

	public fetchUserName(id: Snowflake): Promise<string>;
	public updateStats(): void;
	public dispose(): void;
}

export class SkyraGuild extends KlasaGuild {
	public security: GuildSecurity;
	public starboard: StarboardManager;
}

export class SkyraGuildMember extends GuildMember {
	public guild: SkyraGuild;
	public configs: MemberConfiguration;
}

export class GuildConfiguration extends Configuration {
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
	public stickyRoles: Array<string>;
	private UUID: string;
	private _syncStatus: Promise<this> | null;

	public sync(): Promise<this>;
	public update(amount: number): Promise<this>;
	public editStickyRoles(stickyRoles: Array<string> | string): Promise<this>;
	public destroy(): Promise<void>;
	public toJSON(): { count: number, stickyRoles: Array<string> };
	public toString(): string;
	private _patch(data: { count?: number, stickyRoles?: Array<string> }): void;
	private _sync(): Promise<this>;
	private resolveData(entries: Array<ObjectLiteral>): ObjectLiteral;
}

export class UserConfiguration extends Configuration {
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
	public constructor(manager: StarboardManager, message: KlasaMessage);
	public manager: StarboardManager;
	public channel: KlasaTextChannel;
	public message: KlasaMessage;
	public disabled: boolean;
	public users: Set<Snowflake>;
	public readonly client: Skyra;
	public readonly provider: Provider;
	public readonly emoji: '⭐' | '🌟' | '💫' | '✨';
	public readonly color: number;
	public readonly embed: MessageEmbed;
	public readonly stars: number;
	private starMessage: KlasaMessage | null;
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

	public checkModeratable(msg: KlasaMessage, target: KlasaUser): Promise<SkyraGuildMember>;
	public fetchTargetMember(msg: KlasaMessage, id: Snowflake, throwError: boolean): Promise<SkyraGuildMember | null>;
	public sendModlog(msg: KlasaMessage, target: KlasaUser, reason: Array<string> | string, extraData?: any): Promise<ModerationLog>;
}

export class WeebCommand extends Command {
	public constructor(client: KlasaClient, store: CommandStore, file: string[], core: boolean, options?: WeebCommandOptions);
	public queryType: string;
	public responseName: string;
	public requiresUser: boolean;
	public url: URL;
	public run(msg: KlasaMessage, params: Array<KlasaUser>): Promise<KlasaMessage>;
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
	}
}

export class FriendlyDuration {}

class B10 {
	public constructor(value: number);
	public value: number;
	public readonly hex: HEX;
	public readonly rgb: RGB;
	public readonly hsl: HSL;
	public readonly b10: B10;
	public valid(): boolean;
	public toString(): string;
}

class HEX {
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

class HSL {
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

class RGB {
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
	readonly rgb: RBG;
	readonly hsl: HSL;
	readonly b10: B10;
}

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
}
