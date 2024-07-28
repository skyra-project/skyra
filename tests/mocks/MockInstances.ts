import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { CLIENT_OPTIONS } from '#root/config';
import { SapphireClient } from '@sapphire/framework';
import {
	ChannelType,
	Embed,
	Guild,
	GuildFeature,
	GuildMember,
	GuildMemberFlags,
	GuildNSFWLevel,
	GuildSystemChannelFlags,
	Role,
	RoleFlags,
	TextChannel,
	User,
	type APIChannel,
	type APIEmbed,
	type APIGuild,
	type APIGuildMember,
	type APIRole,
	type APIUser
} from 'discord.js';

export const client = new SapphireClient(CLIENT_OPTIONS);

export function createEmbed(data: APIEmbed) {
	return Reflect.construct(Embed, [data]);
}

export const userData: APIUser = {
	id: '266624760782258186',
	username: 'Skyra',
	discriminator: '7023',
	avatar: '09b52e547fa797c47c7877cd10eb6ba8',
	global_name: null
};

export function createUser(data: Partial<APIUser> = {}) {
	return Reflect.construct(User, [client, { ...userData, ...data }]) as User;
}

export const guildMemberData: APIGuildMember = {
	user: userData,
	deaf: false,
	mute: false,
	nick: null,
	roles: [],
	premium_since: null,
	joined_at: '2019-02-03T21:57:10.354Z',
	flags: GuildMemberFlags.DidRejoin
};

export function createGuildMember(data: Partial<APIGuildMember> = {}, g: Guild = guild) {
	return Reflect.construct(GuildMember, [
		client,
		{ ...guildMemberData, ...data, user: { ...guildMemberData.user, ...data.user! } },
		g
	]) as GuildMember;
}

export const roleData: APIRole = {
	id: '254360814063058944',
	name: '@​everyone',
	color: 0,
	hoist: false,
	position: 0,
	permissions: '104189505',
	managed: false,
	mentionable: false,
	flags: RoleFlags.InPrompt
};

export function createRole(data: Partial<APIRole> = {}, g: Guild = guild) {
	const role = Reflect.construct(Role, [client, { ...roleData, ...data }, g]) as Role;
	g.roles.cache.set(role.id, role);
	return role;
}

export const guildData: APIGuild = {
	id: '254360814063058944',
	name: 'Skyra Lounge',
	icon: 'a_933397e7006838cf97fe70e47605b274',
	description: null,
	discovery_splash: null,
	afk_channel_id: null,
	afk_timeout: 60,
	application_id: null,
	banner: null,
	default_message_notifications: 1,
	emojis: [],
	explicit_content_filter: 2,
	features: [
		GuildFeature.News,
		GuildFeature.AnimatedIcon,
		GuildFeature.Discoverable,
		GuildFeature.WelcomeScreenEnabled,
		GuildFeature.InviteSplash,
		GuildFeature.Community
	],
	max_members: 100000,
	max_presences: null,
	max_video_channel_users: 25,
	mfa_level: 1,
	nsfw_level: GuildNSFWLevel.Default,
	owner_id: '242043489611808769',
	preferred_locale: 'en-US',
	premium_subscription_count: 3,
	premium_progress_bar_enabled: false,
	premium_tier: 1,
	public_updates_channel_id: '700806874294911067',
	region: 'eu-central',
	roles: [roleData],
	rules_channel_id: '409663610780909569',
	splash: null,
	hub_type: null,
	stickers: [],
	safety_alerts_channel_id: null,
	system_channel_flags: GuildSystemChannelFlags.SuppressJoinNotifications,
	system_channel_id: '254360814063058944',
	vanity_url_code: null,
	verification_level: 2,
	widget_channel_id: '409663610780909569',
	widget_enabled: true
};

export function createGuild(data: Partial<APIGuild> = {}) {
	const g = Reflect.construct(Guild, [client, { ...guildData, ...data }]) as Guild;
	client.guilds.cache.set(g.id, g);
	return g;
}
export const guild = createGuild();

export const textChannelData: APIChannel = {
	type: ChannelType.GuildText,
	id: '331027040306331648',
	name: 'staff-testing',
	position: 19,
	parent_id: '355963113696133130',
	permission_overwrites: [],
	topic: null,
	last_message_id: '825133477896388670',
	rate_limit_per_user: 0,
	last_pin_timestamp: '2021-01-17T08:17:36.935Z',
	guild_id: '254360814063058944',
	nsfw: false
};

export function createTextChannel(data: Partial<APIChannel> = {}, g: Guild = guild) {
	const c = Reflect.construct(TextChannel, [guild, { ...textChannelData, ...data }, client]) as TextChannel;
	g.channels.cache.set(c.id, c);
	g.client.channels.cache.set(c.id, c);
	return c;
}
export const textChannel = createTextChannel();

export const commands = client.stores.get('commands');

function addCommand(command: SkyraCommand) {
	commands.set(command.name, command);
	for (const alias of command.aliases) commands.aliases.set(alias, command);
}

class Command extends SkyraCommand {
	public override messageRun = vi.fn();
}
addCommand(
	new Command(
		{ name: 'ping', path: '::virtual::', store: commands, root: '::virtual::' },
		{
			description: LanguageKeys.Commands.General.V7Description,
			detailedDescription: LanguageKeys.Commands.General.V7Extended,
			aliases: ['pong'],
			fullCategory: ['General']
		}
	)
);

addCommand(
	new Command(
		{ name: 'balance', path: '::virtual::', store: commands, root: '::virtual::' },
		{
			description: LanguageKeys.Commands.Admin.ConfDescription,
			detailedDescription: LanguageKeys.Commands.Admin.ConfExtended,
			aliases: ['bal'],
			fullCategory: ['Currency']
		}
	)
);

addCommand(
	new Command(
		{ name: 'define', path: '::virtual::', store: commands, root: '::virtual::' },
		{
			description: LanguageKeys.Commands.Tools.AvatarDescription,
			detailedDescription: LanguageKeys.Commands.Tools.AvatarExtended,
			aliases: ['def', 'definition', 'defination', 'dictionary'],
			fullCategory: ['Tools', 'Dictionary']
		}
	)
);
