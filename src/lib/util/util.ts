import { Image } from 'canvas';
import { Client, Guild, GuildMember, ImageSize, Message, Role, TextChannel, User, VoiceChannel } from 'discord.js';
import { readFile } from 'fs-nextra';
import nodeFetch, { RequestInit, Response } from 'node-fetch';
import { URL } from 'url';
import { isObject } from 'util';
import { ModerationManagerEntry } from '../structures/ModerationManagerEntry';
import { APIEmojiData, APIUserData } from '../types/DiscordAPI';
import { GuildSettings, StickyRole } from '../types/settings/GuildSettings';
import { UserSettings } from '../types/settings/UserSettings';
import { ModerationTypeKeys } from './constants';
import { REGEX_UNICODE_EMOJI } from './External/rUnicodeEmoji';
import { LLRCDataEmoji } from './LongLivingReactionCollector';

const REGEX_FCUSTOM_EMOJI = /<a?:\w{2,32}:\d{17,18}>/;
const REGEX_PCUSTOM_EMOJI = /a?:\w{2,32}:\d{17,18}/;

interface UtilOneToTenEntry {
	emoji: string;
	color: number;
}

export interface ReferredPromise<T> {
	promise: Promise<T>;
	resolve(value?: T): void;
	reject(error?: Error): void;
}

/**
 * Load an image by its path
 * @param path The path to the image to load
 */
export async function loadImage(path: string): Promise<Image> {
	const buffer = await readFile(path);
	const image = new Image();
	image.src = buffer;
	return image;
}

/**
 * Read a stream and resolve to a buffer
 * @param stream The readable stream to read
 */
export async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
	const data = [];
	for await (const buffer of stream) data.push(buffer);
	return Buffer.concat(data);
}

/**
 * Check if the announcement is correctly set up
 * @param message The message instance to check with
 */
export function announcementCheck(message: Message): Role {
	const announcementID = message.guild.settings.get(GuildSettings.Roles.Subscriber) as GuildSettings.Roles.Subscriber;
	if (!announcementID) throw message.language.get('COMMAND_SUBSCRIBE_NO_ROLE');

	const role = message.guild.roles.get(announcementID);
	if (!role) throw message.language.get('COMMAND_SUBSCRIBE_NO_ROLE');

	if (role.position >= message.guild.me.roles.highest.position) throw message.language.get('SYSTEM_HIGHEST_ROLE');
	return role;
}

/**
 * Remove a muted user from the guild
 * @param guild The guild
 * @param id The id of the user
 */
export async function removeMute(guild: Guild, id: string): Promise<boolean> {
	const { settings } = guild;
	const guildStickyRoles = settings.get(GuildSettings.StickyRoles) as GuildSettings.StickyRoles;

	const stickyRolesIndex = guildStickyRoles.findIndex((stickyRole) => stickyRole.user === id);
	if (stickyRolesIndex === -1) return false;

	const stickyRoles = guildStickyRoles[stickyRolesIndex];

	const index = stickyRoles.roles.indexOf(settings.get(GuildSettings.Roles.Muted) as GuildSettings.Roles.Muted);
	if (index === -1) return false;

	stickyRoles.roles.splice(index, 1);
	const { errors } = await (stickyRoles.roles.length
		? settings.update('stickyRoles', { id, roles: stickyRoles.roles }, { arrayIndex: stickyRolesIndex })
		: settings.update('stickyRoles', stickyRoles, { arrayAction: 'remove' }));
	if (errors.length) throw errors;

	return true;
}

/**
 * Resolve an emoji
 * @param emoji The emoji to resolve
 */
export function resolveEmoji(emoji: string | APIEmojiData | LLRCDataEmoji) {
	if (typeof emoji === 'string') {
		if (REGEX_FCUSTOM_EMOJI.test(emoji)) return emoji.slice(1, -1);
		if (REGEX_PCUSTOM_EMOJI.test(emoji)) return emoji;
		if (REGEX_UNICODE_EMOJI.test(emoji)) return encodeURIComponent(emoji);
	} else if (isObject(emoji)) {
		return emoji.id ? `${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}` : encodeURIComponent(emoji.name);
	}
	return null;
}

export function oneToTen(level: number): UtilOneToTenEntry {
	level |= 0;
	if (level < 0) level = 0;
	else if (level > 10) level = 10;
	return ONE_TO_TEN.get(level);
}

/**
 * Split a string by its latest space character in a range from the character 0 to the selected one.
 * @param str The text to split.
 * @param length The length of the desired string.
 * @param char The character to split with
 */
export function splitText(str: string, length: number, char: string = ' ') {
	const x = str.substring(0, length).lastIndexOf(char);
	const pos = x === -1 ? length : x;
	return str.substring(0, pos);
}

/**
 * Split a text by its latest space character in a range from the character 0 to the selected one.
 * @param str The text to split.
 * @param length The length of the desired string.
 */
export function cutText(str: string, length: number) {
	if (str.length < length) return str;
	const cut = splitText(str, length - 3);
	if (cut.length < length - 3) return `${cut}...`;
	return `${cut.slice(0, length - 3)}...`;
}

export function fetchAvatar(user: User, size: ImageSize = 512): Promise<Buffer> {
	const url = user.avatar ? user.avatarURL({ format: 'png', size }) : user.defaultAvatarURL;
	return fetch(url, 'buffer').catch((err) => { throw `Could not download the profile avatar: ${err}`; });
}

export async function fetchReactionUsers(client: Client, channelID: string, messageID: string, reaction: string) {
	const users: Set<string> = new Set();
	let rawUsers: APIUserData[];

	// Fetch loop, to get +100 users
	do {
		rawUsers = await (client as any).api.channels(channelID).messages(messageID).reactions(reaction)
			.get({ query: { limit: 100, after: rawUsers && rawUsers.length ? rawUsers[rawUsers.length - 1].id : undefined } }) as APIUserData[];
		for (const user of rawUsers) users.add(user.id);
	} while (rawUsers.length === 100);

	return users;
}

export async function fetch(url: URL | string, type: 'json'): Promise<any>;
export async function fetch(url: URL | string, options: RequestInit, type: 'json'): Promise<any>;
export async function fetch(url: URL | string, type: 'buffer'): Promise<Buffer>;
export async function fetch(url: URL | string, options: RequestInit, type: 'buffer'): Promise<Buffer>;
export async function fetch(url: URL | string, type: 'text'): Promise<string>;
export async function fetch(url: URL | string, options: RequestInit, type: 'text'): Promise<string>;
export async function fetch(url: URL | string, type: 'result'): Promise<Response>;
export async function fetch(url: URL | string, options: RequestInit, type: 'result'): Promise<Response>;
export async function fetch(url: URL | string, options: RequestInit, type: 'result' | 'json' | 'buffer' | 'text'): Promise<Response | Buffer | string | any>;
export async function fetch(url: URL | string, options: RequestInit | 'result' | 'json' | 'buffer' | 'text', type?: 'result' | 'json' | 'buffer' | 'text'): Promise<any> {
	if (typeof options === 'undefined') {
		options = {};
		type = 'json';
	} else if (typeof options === 'string') {
		type = options;
		options = {};
	} else if (typeof type === 'undefined') {
		type = 'json';
	}

	// @ts-ignore
	const result: Response = await nodeFetch(url, options);
	if (!result.ok) throw result.statusText;

	switch (type) {
		case 'result': return result;
		case 'buffer': return result.buffer();
		case 'json': return result.json();
		case 'text': return result.text();
		default: throw new Error(`Unknown type ${type}`);
	}
}

/**
 * Get the content from a message.
 * @param message The Message instance to get the content from
 */
export function getContent(message: Message): string | null {
	if (message.content) return message.content;
	for (const embed of message.embeds) {
		if (embed.description) return embed.description;
		if (embed.fields.length) return embed.fields[0].value;
	}
	return null;
}

/**
 * Get the image url from a message.
 * @param message The Message instance to get the image url from
 */
export function getImage(message: Message): string | null {
	if (message.attachments.size) {
		const attachment = message.attachments.find((att) => IMAGE_EXTENSION.test(att.url));
		if (attachment) return attachment.url;
	}
	for (const embed of message.embeds) {
		if (embed.type === 'image') return embed.url;
		if (embed.image) return embed.image.url;
	}
	return null;
}

export function getColor(message: Message) {
	const settingsColor = message.author.settings.get(UserSettings.Color) as UserSettings.Color;
	if (settingsColor) {
		return parseInt(settingsColor, 16);
	}
	return (message.member && message.member.displayColor) || null;
}

/**
 * Create a referred promise
 */
export function createReferPromise<T>(): ReferredPromise<T> {
	let resolve, reject;
	const promise: Promise<T> = new Promise((res, rej) => {
		resolve = res;
		reject = rej;
	});

	return { promise, resolve, reject };
}

/**
 * Parse a range
 * @param input The input to parse
 * @example
 * parseRange('23..25');
 * // -> [23, 24, 25]
 */
export function parseRange(input: string): number[] {
	const [, smin, smax] = /(\d+)\.{2,}(\d+)/.exec(input) || [null, input, input];
	let min = parseInt(smin), max = parseInt(smax);
	if (min > max) [max, min] = [min, max];
	return Array.from({ length: max - min + 1 }, (_, index) => min + index);
}

/**
 * Clean all mentions from a content
 * @param message The message for context
 * @param input The input to clean
 */
export function cleanMentions(message: Message, input: string) {
	return input
		.replace(/@(here|everyone)/g, '@\u200B$1')
		.replace(/<(@[!&]?|#)(\d{17,19})>/g, (match, type, id) => {
			switch (type) {
				case '@':
				case '@!': {
					const usertag = message.client.usertags.get(id);
					return usertag ? `@${usertag.slice(0, usertag.lastIndexOf('#'))}` : match;
				}
				case '@&': {
					const role = message.guild ? message.guild.roles.get(id) : null;
					return role ? `@${role.name}` : match;
				}
				case '#': {
					const channel = message.guild ? message.guild.channels.get(id) : null;
					return channel ? `#${channel.name}` : match;
				}
				default: return match;
			}
		});
}

/**
 * Creates an array picker function
 * @param array The array to create a pick function from
 * @example
 * const picker = createPick([1, 2, 3, 4]);
 * picker(); // 2
 * picker(); // 1
 * picker(); // 4
 */
export function createPick<T>(array: T[]): () => T {
	const { length } = array;
	return () => array[Math.floor(Math.random() * length)];
}

/**
 * Mute a member
 * @param moderator The member who mutes
 * @param target The member to mute
 * @param reason The reason for the mute
 */
export async function mute(moderator: GuildMember, target: GuildMember, reason?: string): Promise<ModerationManagerEntry> {
	const role = target.guild.roles.get(target.guild.settings.get(GuildSettings.Roles.Muted) as GuildSettings.Roles.Muted);
	if (!role) throw target.guild.language.get('COMMAND_MUTE_UNCONFIGURED');

	const all = target.guild.settings.get(GuildSettings.StickyRoles) as GuildSettings.StickyRoles;

	const stickyRolesIndex = all.findIndex((stickyRole) => stickyRole.user === target.id);
	const stickyRoles: StickyRole = stickyRolesIndex !== -1 ? all[stickyRolesIndex] : { roles: [], user: target.id };
	if (stickyRoles.roles.includes(role.id)) throw target.guild.language.get('COMMAND_MUTE_MUTED');

	// Parse the roles
	const roles = muteGetRoles(target);

	await target.edit({ roles: target.roles.filter((r) => r.managed).map((r) => r.id).concat(role.id) });
	const entry: StickyRole = { roles: stickyRoles.roles.concat(role.id), user: target.id };
	const { errors } = await target.guild.settings.update('stickyRoles', entry, stickyRolesIndex !== -1 ? { arrayIndex: stickyRolesIndex } : { arrayAction: 'add' });
	if (errors.length) throw errors[0];

	const modlog = target.guild.moderation.new
		.setModerator(moderator.id)
		.setUser(target.id)
		.setType(ModerationTypeKeys.Mute)
		.setReason(reason)
		.setExtraData(roles);
	return modlog.create();
}

/**
 * Softban a member
 * @param guild The guild for context
 * @param moderator The member who mutes
 * @param target The member to mute
 * @param reason The reason for the mute
 * @param days The number of days for the prune messages
 */
export async function softban(guild: Guild, moderator: User, target: User, reason: string = null, days: number = 1): Promise<ModerationManagerEntry> {
	await guild.members.ban(target.id, {
		days,
		reason: `${reason ? `Softban with reason: ${reason}` : null}`
	});
	await guild.members.unban(target.id, 'Softban.');

	const modlog = guild.moderation.new
		.setModerator(moderator.id)
		.setUser(target.id)
		// @ts-ignore
		.setType(TYPE_KEYS.SOFT_BAN)
		.setReason(reason);
	return modlog.create();
}

/**
 * Get all the roles for the mute
 * @param member The member to get the roles from
 */
export function muteGetRoles(member: GuildMember): string[] {
	const roles = [...member.roles.keys()];
	roles.splice(roles.indexOf(member.guild.id), 1);
	return roles;
}

/**
 * Create the mute role
 * @param message The message instance to use as context
 */
export async function createMuteRole(message: Message): Promise<Role> {
	const id = message.guild.settings.get(GuildSettings.Roles.Muted) as GuildSettings.Roles.Muted;
	if (id && message.guild.roles.has(id)) throw message.language.get('SYSTEM_GUILD_MUTECREATE_MUTEEXISTS');

	if (message.guild.roles.size === 250) throw message.language.get('SYSTEM_GUILD_MUTECREATE_TOOMANYROLES');
	const role = await message.guild.roles.create(MUTE_ROLE_OPTIONS);
	const { channels } = message.guild;
	await message.sendLocale('SYSTEM_GUILD_MUTECREATE_APPLYING', [channels.size, role]);
	const denied = [];
	let accepted = 0;

	for (const channel of channels.values()) {
		await _createMuteRolePush(channel as TextChannel | VoiceChannel, role, denied);
		accepted++;
	}

	const messageEdit2 = message.language.get('SYSTEM_GUILD_MUTECREATE_EXCEPTIONS', denied);
	await message.guild.settings.update(GuildSettings.Roles.Muted, role.id);
	await message.sendLocale('SYSTEM_GUILD_MUTECREATE_APPLIED', [accepted, messageEdit2, message.author, role]);
	return role;
}

export function inlineCodeblock(input: string) {
	return `\`${input.replace(/ /g, '\u00A0').replace(/`/g, '\\`')}\``;
}

/**
 * Push the permissions for the muted role into a channel
 * @param channel The channel to modify
 * @param role The role to update
 * @param array The array to push in case it did fail
 */
async function _createMuteRolePush(channel: TextChannel | VoiceChannel, role: Role, array: string[]): Promise<void> {
	if (channel.type === 'category') return;
	try {
		await channel.updateOverwrite(role, MUTE_ROLE_PERMISSIONS[channel.type]);
	} catch {
		array.push(String(channel));
	}
}

const MUTE_ROLE_PERMISSIONS = Object.freeze({
	text: { SEND_MESSAGES: false, ADD_REACTIONS: false },
	voice: { CONNECT: false }
});

const MUTE_ROLE_OPTIONS = Object.freeze({
	data: {
		color: 0x422C0B,
		hoist: false,
		mentionable: false,
		name: 'Muted',
		permissions: []
	},
	reason: '[SETUP] Authorized to create a \'Muted\' role.'
});

const ONE_TO_TEN = new Map([
	[0, { emoji: '😪', color: 0x5B1100 }],
	[1, { emoji: '😪', color: 0x5B1100 }],
	[2, { emoji: '😫', color: 0xAB1100 }],
	[3, { emoji: '😔', color: 0xFF2B00 }],
	[4, { emoji: '😒', color: 0xFF6100 }],
	[5, { emoji: '😌', color: 0xFF9C00 }],
	[6, { emoji: '😕', color: 0xB4BF00 }],
	[7, { emoji: '😬', color: 0x84FC00 }],
	[8, { emoji: '🙂', color: 0x5BF700 }],
	[9, { emoji: '😃', color: 0x24F700 }],
	[10, { emoji: '😍', color: 0x51D4EF }]
]);

export const IMAGE_EXTENSION = /\.(bmp|jpe?g|png|gif|webp)$/i;

/**
 * @enumerable decorator that sets the enumerable property of a class field to false.
 * @param value true|false
 */
export function enumerable(value: boolean): (target: any, propertyKey: string) => void {
	return (target, key): void => {
		Object.defineProperty(target, key, {
			enumerable: value,
			set(this: any, val: any): void {
				// tslint:disable-next-line
				Object.defineProperty(this, key, {
					configurable: true,
					enumerable: value,
					value: val,
					writable: true,
				});
			},
		});
	};
}
