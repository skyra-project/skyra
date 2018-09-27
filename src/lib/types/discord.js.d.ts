import {
	BanOptions,
	Base64Resolvable,
	BufferResolvable,
	ClientUser,
	Collection,
	DataStore,
	FetchMemberOptions,
	GuildMember,
	GuildMemberResolvable,
	GuildPruneMembersOptions,
	GuildResolvable,
	MessageEmbed,
	MessageOptions,
	Snowflake,
	UserResolvable,
	ChannelResolvable,
	GuildChannel,
	GuildCreateChannelOptions
} from 'discord.js';
import {
	KlasaGuild,
	KlasaMessage,
	KlasaUser,
	Settings,
	KlasaTextChannel,
	KlasaVoiceChannel
} from 'klasa';
import Skyra from '../Skyra';
import {
	MemberSettings,
	SkyraGuild,
	SkyraUser,
	UserSettings
} from './klasa';

export class SkyraClientUser extends ClientUser {
	public client: Skyra;
	public settings: UserSettings;
}

export { SkyraClientUser as ClientUser };

declare class SkyraMessageEmbed extends MessageEmbed {
	public splitFields(input: string | string[]): this;
}

export { SkyraMessageEmbed as MessageEmbed };

export class SkyraUserStore extends DataStore<Snowflake, SkyraUser, typeof SkyraUser, UserResolvable> {
	public constructor(client: Skyra, iterable?: Iterable<any>);
	public fetch(id: Snowflake, cache?: boolean): Promise<SkyraUser>;
}

export class SkyraGuildStore extends DataStore<Snowflake, SkyraGuild, typeof SkyraGuild, GuildResolvable> {
	public constructor(client: Skyra, iterable?: Iterable<any>);
	public create(name: string, options?: { region?: string, icon?: BufferResolvable | Base64Resolvable }): Promise<SkyraGuild>;
}

export class SkyraGuildMemberStore extends DataStore<Snowflake, SkyraGuildMember, typeof SkyraGuildMember, GuildMemberResolvable> {
	public constructor(guild: SkyraGuild, iterable?: Iterable<any>);
	public ban(user: UserResolvable, options?: BanOptions): Promise<SkyraGuildMember | SkyraUser | Snowflake>;
	public fetch(options: UserResolvable | FetchMemberOptions): Promise<SkyraGuildMember>;
	public fetch(): Promise<SkyraGuildMemberStore>;
	public fetch(options: FetchMemberOptions): Promise<Collection<Snowflake, SkyraGuildMember>>;
	public prune(options?: GuildPruneMembersOptions): Promise<number>;
	public unban(user: UserResolvable, reason?: string): Promise<SkyraUser>;
}

export class SkyraGuildChannel extends GuildChannel {
	// @ts-ignore
	public client: Skyra;
	// @ts-ignore
	public guild: SkyraGuild;
}

export class SkyraGuildChannelStore extends DataStore<Snowflake, SkyraGuildChannel, ChannelResolvable> {
	constructor(guild: SkyraGuild, iterable?: Iterable<any>);
	public create(name: string, options?: GuildCreateChannelOptions): Promise<KlasaTextChannel | KlasaVoiceChannel>;
}

export class SkyraGuildMember extends GuildMember {
	// @ts-ignore
	public client: Skyra;
	public settings: MemberSettings;
	// @ts-ignore
	public guild: SkyraGuild;
}
