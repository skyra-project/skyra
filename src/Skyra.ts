import { Canvas } from 'canvas-constructor';
import { Permissions } from 'discord.js';
import { join } from 'path';
import { inspect } from 'util';
import { CLIENT_OPTIONS, DEV, TOKENS } from '../config';
import { SkyraClient } from './lib/SkyraClient';
import { GuildSettings } from './lib/types/settings/GuildSettings';
inspect.defaultOptions.depth = 1;

export const rootFolder = join(__dirname, '..', '..');
export const assetsFolder = join(rootFolder, 'assets');
export const cdnFolder = DEV ? join(assetsFolder, 'public') : join('/var', 'www', 'assets');

import klasaDashboardHooks = require('klasa-dashboard-hooks');
import { PermissionLevels } from './lib/types/Enums';
SkyraClient.use(klasaDashboardHooks);

const { FLAGS } = Permissions;

// Canvas setup
Canvas
	.registerFont(join(assetsFolder, 'fonts', 'Roboto-Regular.ttf'), 'RobotoRegular')
	.registerFont(join(assetsFolder, 'fonts', 'NotoEmoji.ttf'), 'RobotoRegular')
	.registerFont(join(assetsFolder, 'fonts', 'NotoSans-Regular.ttf'), 'RobotoRegular')
	.registerFont(join(assetsFolder, 'fonts', 'Roboto-Light.ttf'), 'RobotoLight')
	.registerFont(join(assetsFolder, 'fonts', 'Family-Friends.ttf'), 'FamilyFriends');

// Skyra setup
SkyraClient.defaultPermissionLevels
	.add(PermissionLevels.Staff, message => message.member
		? message.guild!.settings.get(GuildSettings.Roles.Staff)
			? message.member.roles.has(message.guild!.settings.get(GuildSettings.Roles.Staff))
			: message.member.permissions.has(FLAGS.MANAGE_MESSAGES)
		: false, { fetch: true })
	.add(PermissionLevels.Moderator, message => message.member
		? message.guild!.settings.get(GuildSettings.Roles.Moderator)
			? message.member.roles.has(message.guild!.settings.get(GuildSettings.Roles.Moderator))
			: message.member.permissions.has(FLAGS.BAN_MEMBERS)
		: false, { fetch: true })
	.add(PermissionLevels.Administrator, message => message.member
		? message.guild!.settings.get(GuildSettings.Roles.Admin)
			? message.member.roles.has(message.guild!.settings.get(GuildSettings.Roles.Admin))
			: message.member.permissions.has(FLAGS.MANAGE_GUILD)
		: false, { fetch: true });

const client = new SkyraClient(CLIENT_OPTIONS);
client.login(CLIENT_OPTIONS.dev ? TOKENS.BOT.DEV : TOKENS.BOT.STABLE)
	.catch(error => { client.console.error(error); });
