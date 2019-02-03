import { Canvas } from 'canvas-constructor';
import { Permissions } from 'discord.js';
import { join } from 'path';
import { inspect } from 'util';
import { CLIENT_OPTIONS, DEV, TOKENS } from '../config';
import { SkyraClient } from './lib/SkyraClient';
inspect.defaultOptions.depth = 1;

export const rootFolder = join(__dirname, '..', '..');
export const assetsFolder = join(rootFolder, 'assets');
export const cdnFolder = DEV ? join(assetsFolder, 'public') : join('/var', 'www', 'assets');

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
    .add(4, (message) => message.member ? message.guild.settings.get('roles.staff')
        ? message.member.roles.has(message.guild.settings.get('roles.staff') as string)
        : message.member.permissions.has(FLAGS.MANAGE_MESSAGES) : false, { fetch: true })
    .add(5, (message) => message.member ? message.guild.settings.get('roles.moderator')
        ? message.member.roles.has(message.guild.settings.get('roles.moderator') as string)
        : message.member.permissions.has(FLAGS.BAN_MEMBERS) : false, { fetch: true })
    .add(6, (message) => message.member ? message.guild.settings.get('roles.admin')
        ? message.member.roles.has(message.guild.settings.get('roles.admin') as string)
        : message.member.permissions.has(FLAGS.MANAGE_GUILD) : false, { fetch: true });

const client = new SkyraClient(CLIENT_OPTIONS);
client.login(CLIENT_OPTIONS.dev ? TOKENS.BOT.DEV : TOKENS.BOT.STABLE).catch((error) => { client.console.error(error); });

if (!CLIENT_OPTIONS.dev) {
    client.ipc.connectTo('ny-api', 9997)
        .catch((error) => { client.console.error(error); });
}
