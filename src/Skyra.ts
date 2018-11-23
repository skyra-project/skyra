import { Canvas } from 'canvas-constructor';
import { Permissions } from 'discord.js';
import { join } from 'path';
import { inspect } from 'util';
import { CLIENT_OPTIONS, TOKENS } from '../config';
import { SkyraClient } from './lib/SkyraClient';
inspect.defaultOptions.depth = 1;

export const rootFolder = join(__dirname, '..');
export const assetsFolder = join(rootFolder, 'assets');

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
    .add(4, (_, msg) => msg.member ? msg.guild.settings.get('roles.staff')
        ? msg.member.roles.has(msg.guild.settings.get('roles.staff') as string)
        : msg.member.permissions.has(FLAGS.MANAGE_MESSAGES) : false, { fetch: true })
    .add(5, (_, msg) => msg.member ? msg.guild.settings.get('roles.moderator')
        ? msg.member.roles.has(msg.guild.settings.get('roles.moderator') as string)
        : msg.member.permissions.has(FLAGS.BAN_MEMBERS) : false, { fetch: true })
    .add(6, (_, msg) => msg.member ? msg.guild.settings.get('roles.admin')
        ? msg.member.roles.has(msg.guild.settings.get('roles.admin') as string)
        : msg.member.permissions.has(FLAGS.MANAGE_GUILD) : false, { fetch: true });

const client = new SkyraClient(CLIENT_OPTIONS);
client.login(CLIENT_OPTIONS.dev ? TOKENS.BOT.DEV : TOKENS.BOT.STABLE).catch((error) => { client.console.error(error); });

if (!CLIENT_OPTIONS.dev) {
    client.ipc.connectTo('ny-api', 9997)
        .catch((error) => { client.console.error(error); });
}
