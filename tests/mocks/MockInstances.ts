import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { CLIENT_OPTIONS } from '#root/config';
import { SapphireClient } from '@sapphire/framework';
import { APIChannel, APIGuild, ChannelType, GuildFeature } from 'discord-api-types/v6';
import { Guild, TextChannel } from 'discord.js';
import { resolve } from 'path';

export const client = new SapphireClient(CLIENT_OPTIONS);

export const guildData: APIGuild = {
	id: '254360814063058944',
	name: 'Skyra Lounge',
	icon: 'a_933397e7006838cf97fe70e47605b274',
	description: null,
	splash: null,
	discovery_splash: null,
	features: [
		GuildFeature.NEWS,
		GuildFeature.ANIMATED_ICON,
		GuildFeature.COMMERCE,
		GuildFeature.WELCOME_SCREEN_ENABLED,
		GuildFeature.INVITE_SPLASH,
		GuildFeature.COMMUNITY
	],
	emojis: [],
	banner: null,
	owner_id: '242043489611808769',
	application_id: null,
	region: 'eu-central',
	afk_channel_id: null,
	afk_timeout: 60,
	system_channel_id: '254360814063058944',
	widget_enabled: true,
	widget_channel_id: '409663610780909569',
	verification_level: 2,
	roles: [
		{
			id: '254360814063058944',
			name: '@​everyone',
			color: 0,
			hoist: false,
			position: 0,
			permissions: 104189505,
			permissions_new: '104189505',
			managed: false,
			mentionable: false
		}
	],
	default_message_notifications: 1,
	mfa_level: 1,
	explicit_content_filter: 2,
	max_presences: null,
	max_members: 100000,
	max_video_channel_users: 25,
	vanity_url_code: null,
	premium_tier: 1,
	premium_subscription_count: 3,
	system_channel_flags: 0,
	preferred_locale: 'en-US',
	rules_channel_id: '409663610780909569',
	public_updates_channel_id: '700806874294911067',
	embed_enabled: true,
	embed_channel_id: '409663610780909569'
};
export const guild = new Guild(client, guildData);

export const textChannelData: APIChannel = {
	type: ChannelType.GUILD_TEXT,
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
export const textChannel = new TextChannel(guild, textChannelData);

export const commands = client.stores.get('commands');

function addCommand(command: SkyraCommand) {
	commands.set(command.name, command);
	for (const alias of command.aliases) commands.aliases.set(alias, command);
}

class Command extends SkyraCommand {}
addCommand(
	new Command(
		{ name: 'ping', path: resolve('/home/skyra/commands/General/Chat Bot Info/ping.js'), store: commands },
		{ description: LanguageKeys.Commands.General.PingDescription, extendedHelp: LanguageKeys.Commands.General.PingExtended, aliases: ['pong'] }
	)
);

addCommand(
	new Command(
		{ name: 'balance', path: resolve('/home/skyra/commands/Social/balance.js'), store: commands },
		{ description: LanguageKeys.Commands.Social.BalanceDescription, extendedHelp: LanguageKeys.Commands.Social.BalanceExtended, aliases: ['bal'] }
	)
);
