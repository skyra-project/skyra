import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { CLIENT_OPTIONS } from '#root/config';
import { SapphireClient } from '@sapphire/framework';
import { APIChannel, APIGuild, APIGuildMember, APIRole, APIUser, ChannelType, GuildFeature, GuildNSFWLevel } from 'discord-api-types/v9';
import { Guild, GuildMember, Role, TextChannel, User } from 'discord.js';
import { resolve } from 'node:path';

export const client = new SapphireClient(CLIENT_OPTIONS);

export const userData: APIUser = {
	id: '266624760782258186',
	username: 'Skyra',
	discriminator: '7023',
	avatar: '09b52e547fa797c47c7877cd10eb6ba8'
};

export function createUser(data: Partial<APIUser> = {}) {
	return new User(client, { ...userData, ...data });
}

export const guildMemberData: APIGuildMember = {
	user: userData,
	deaf: false,
	mute: false,
	nick: null,
	roles: [],
	premium_since: null,
	joined_at: '2019-02-03T21:57:10.354Z'
};

export function createGuildMember(data: Partial<APIGuildMember> = {}, g: Guild = guild) {
	return new GuildMember(client, { ...guildMemberData, ...data, user: { ...guildMemberData.user, ...data.user! } }, g);
}

export const roleData: APIRole = {
	id: '254360814063058944',
	name: '@​everyone',
	color: 0,
	hoist: false,
	position: 0,
	permissions: '104189505',
	managed: false,
	mentionable: false
};

export function createRole(data: Partial<APIRole> = {}, g: Guild = guild) {
	const role = new Role(client, { ...roleData, ...data }, g);
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
		GuildFeature.Commerce,
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
	premium_tier: 1,
	public_updates_channel_id: '700806874294911067',
	region: 'eu-central',
	roles: [roleData],
	rules_channel_id: '409663610780909569',
	splash: null,
	stickers: [],
	system_channel_flags: 0,
	system_channel_id: '254360814063058944',
	vanity_url_code: null,
	verification_level: 2,
	widget_channel_id: '409663610780909569',
	widget_enabled: true
};

export function createGuild(data: Partial<APIGuild> = {}) {
	const g = new Guild(client, { ...guildData, ...data });
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
	const c = new TextChannel(guild, { ...textChannelData, ...data });
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

class Command extends SkyraCommand {}
addCommand(
	new Command(
		{
			name: 'ping',
			path: resolve('/home/skyra/commands/General/Chat Bot Info/ping.js'),
			store: commands,
			root: '/home/skyra/commands'
		},
		{
			description: LanguageKeys.Commands.General.PingDescription,
			detailedDescription: LanguageKeys.Commands.General.PingExtended,
			aliases: ['pong'],
			fullCategory: ['General']
		}
	)
);

addCommand(
	new Command(
		{
			name: 'balance',
			path: resolve('/home/skyra/commands/admin/conf.js'),
			store: commands,
			root: '/home/skyra/commands'
		},
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
		{
			name: 'define',
			path: resolve('/home/skyra/commands/Tools/Dictionary/define.js'),
			store: commands,
			root: '/home/skyra/commands'
		},
		{
			description: LanguageKeys.Commands.Tools.DefineDescription,
			detailedDescription: LanguageKeys.Commands.Tools.DefineExtended,
			aliases: ['def', 'definition', 'defination', 'dictionary'],
			fullCategory: ['Tools', 'Dictionary']
		}
	)
);
