// @ts-ignore
import * as canvas from 'canvas';
import { Constructable, ImageSize, MessageAttachment, MessageEmbed, PermissionOverwriteOption, Role, RoleData, Snowflake } from 'discord.js';
import { readFile } from 'fs-nextra';
import { STATUS_CODES } from 'http';
import { KlasaGuildChannel, Type } from 'klasa';
import fetch, { RequestInit, Response } from 'node-fetch';
import { Readable } from 'stream';
import { URL } from 'url';
import { SkyraGuildMember } from '../types/discord.js';
import { SkyraGuild, SkyraMessage, SkyraUser } from '../types/klasa';

const REGEX_FCUSTOM_EMOJI: RegExp = /<a?:\w{2,32}:\d{17,18}>/;
const REGEX_PCUSTOM_EMOJI: RegExp = /a?:\w{2,32}:\d{17,18}/;
import REGEX_UNICODE_EMOJI from './External/rUnicodeEmoji';
const { Image }: { Image: CanvasImageConstructor } = canvas;

type CanvasImageConstructor = Constructable<CanvasImage>;
type CanvasImage = { src: Buffer };

/**
 * The static Util class
 * @version 2.0.0
 */
export default class Util {

	private static ONE_TO_TEN: Readonly<Record<UtilOneToTenKey, UtilOneToTenValue>> = Object.freeze({
		0: { emoji: '😪', color: 0x5B1100 },
		1: { emoji: '😪', color: 0x5B1100 },
		2: { emoji: '😫', color: 0xAB1100 },
		3: { emoji: '😔', color: 0xFF2B00 },
		4: { emoji: '😒', color: 0xFF6100 },
		5: { emoji: '😌', color: 0xFF9C00 },
		6: { emoji: '😕', color: 0xB4BF00 },
		7: { emoji: '😬', color: 0x84FC00 },
		8: { emoji: '🙂', color: 0x5BF700 },
		9: { emoji: '😃', color: 0x24F700 },
		10: { emoji: '😍', color: 0x51D4EF }
	});

	private static MUTE_ROLE_PERMISSIONS: Readonly<{ text: PermissionOverwriteOption; voice: PermissionOverwriteOption }> = Object.freeze({
		text: { SEND_MESSAGES: false, ADD_REACTIONS: false },
		voice: { CONNECT: false }
	});

	private static MUTE_ROLE_OPTIONS: Readonly<{ data: RoleData; reason: string }> = Object.freeze({
		data: {
			color: 0x422C0B,
			hoist: false,
			mentionable: false,
			name: 'Muted',
			permissions: []
		},
		reason: '[SETUP] Authorized to create a \'Muted\' role.'
	});

	private static IMAGE_EXTENSION: RegExp = /\.(bmp|jpe?g|png|gif|webp)$/i;

	/**
	 * Read a stream and resolve to a buffer
	 * @since 3.2.0
	 * @param stream The readable stream to read
	 */
	public static streamToBuffer(stream: Readable): Promise<Buffer> {
		if (!(stream instanceof Readable)) throw new TypeError(`Expected stream to be a Readable stream, got: ${new Type(stream)}`);

		return new Promise((res, rej) => {
			const array: Array<Buffer> = [];

			function onData(data: Buffer): void {
				array.push(data);
			}

			function finish(error?: Error): void {
				stream.removeAllListeners();
				return error ? rej(error) : res(Buffer.concat(array));
			}

			stream.on('data', onData);
			stream.on('end', finish);
			stream.on('error', finish);
			stream.on('close', finish);
		});
	}

	/**
	 * Load an image for Canvas
	 * @since 3.0.0
	 * @param path The path to fix
	 */
	public static async loadImage(path: string): Promise<CanvasImage> {
		const buffer: Buffer = await readFile(path);
		const image: CanvasImage = new Image();
		image.src = buffer;
		return image;
	}

	// Check operations

	/**
	 * Check if the announcement is correctly set up
	 * @since 3.0.0
	 * @param msg The message instance to check with
	 */
	public static announcementCheck(msg: SkyraMessage): Role {
		const announcementID: string | null = msg.guild.settings.roles.subscriber;
		if (!announcementID) throw msg.language.get('COMMAND_SUBSCRIBE_NO_ROLE');

		const role: Role | undefined = msg.guild.roles.get(announcementID);
		if (!role) throw msg.language.get('COMMAND_SUBSCRIBE_NO_ROLE');

		if (role.position >= msg.guild.me.roles.highest.position) throw msg.language.get('SYSTEM_HIGHEST_ROLE');
		return role;
	}

	public static async removeMute(guild: SkyraGuild, id: Snowflake): Promise<boolean> {
		const { settings } = guild;

		if (!settings.roles.muted) return false;

		const stickyRolesIndex: number = settings.stickyRoles.findIndex((stickyRole) => stickyRole.id === id);
		if (stickyRolesIndex === -1) return false;

		const stickyRoles: { id: Snowflake; roles: Snowflake[] } = settings.stickyRoles[stickyRolesIndex];

		const index: number = stickyRoles.roles.indexOf(settings.roles.muted);
		if (index === -1) return false;

		stickyRoles.roles.splice(index, 1);

		const { errors } = await (stickyRoles.roles.length
			? settings.update('stickyRoles', { id, roles: stickyRoles.roles }, { arrayPosition: stickyRolesIndex })
			: settings.update('stickyRoles', stickyRoles, { action: 'remove' }));
		if (errors.length) guild.client.emit('wtf', errors);

		return true;
	}

	/**
	 * Check if a member is moderatable
	 * @since 3.0.0
	 * @param msg The message instance to check with
	 * @param moderator The moderator that triggered this check
	 * @param target The member to check against
	 */
	public static moderationCheck(msg: SkyraMessage, moderator: SkyraGuildMember, target: SkyraGuildMember): void {
		if (target === msg.guild.me) throw msg.language.get('COMMAND_TOSKYRA');
		if (target === moderator) throw msg.language.get('COMMAND_USERSELF');
		if (target === msg.guild.owner) throw msg.language.get('COMMAND_ROLE_HIGHER_SKYRA');
		const { position } = target.roles.highest;
		if (position >= msg.guild.me.roles.highest.position) throw msg.language.get('COMMAND_ROLE_HIGHER_SKYRA');
		if (position >= moderator.roles.highest.position) throw msg.language.get('COMMAND_ROLE_HIGHER');
	}

	// Misc utils

	/**
	 * Resolve an emoji
	 * @since 3.2.0
	 * @param emoji The emoji to resolve
	 */
	public static resolveEmoji(emoji: string): string | null {
		if (REGEX_FCUSTOM_EMOJI.test(emoji)) return emoji.slice(1, -1);
		if (REGEX_PCUSTOM_EMOJI.test(emoji)) return emoji;
		if (REGEX_UNICODE_EMOJI.test(emoji)) return encodeURIComponent(emoji);
		return null;
	}

	/**
	 * Get an one-to-ten entry
	 * @since 3.0.0
	 * @param level The number to check against
	 */
	public static oneToTen(level: number): UtilOneToTenValue {
		if (level < 0) level = 0;
		else if (level > 10) level = 10;
		return Util.ONE_TO_TEN[<UtilOneToTenKey> (level | 0)];
	}

	/**
	 * Wrap a basic auth
	 * @since 3.0.0
	 * @param user The username
	 * @param pass The password
	 */
	public static basicAuth(user: string, pass: string): string {
		return `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`;
	}

	/**
	 * Get a formatted status code
	 * @since 3.0.0
	 * @param code The status code to check against
	 */
	public static httpResponses(code: number): string {
		return `[${code}] ${STATUS_CODES[code]}`;
	}

	/**
	 * Split a string by its latest space character in a range from the character 0 to the selected one.
	 * @since 2.0.0
	 * @param str The text to split.
	 * @param length The length of the desired string.
	 * @param char The character to split with
	 */
	public static splitText(str: string, length: number, char: string = ' '): string {
		const x: number = str.substring(0, length).lastIndexOf(char);
		const pos: number = x === -1 ? length : x;
		return str.substring(0, pos);
	}

	/**
	 * Split a text by its latest space character in a range from the character 0 to the selected one.
	 * @since 3.0.1
	 * @param str The text to split.
	 * @param length The length of the desired string.
	 */
	public static cutText(str: string, length: number): string {
		if (str.length < length) return str;
		const cut: string = Util.splitText(str, length - 3);
		if (cut.length < length - 3) return `${cut}...`;
		return `${cut.slice(0, length - 3)}...`;
	}

	/**
	 * Fetch a user's avatar.
	 * @since 2.0.0
	 * @param user The user.
	 * @param size The size of the avatar to download.
	 */
	public static fetchAvatar(user: SkyraUser, size: ImageSize = 512): Promise<Buffer> {
		const url: string = user.avatar ? user.avatarURL({ format: 'png', size }) : user.defaultAvatarURL;
		return Util.fetch(url, 'buffer').catch((err) => { throw `Could not download the profile avatar: ${err}`; });
	}

	/**
	 * Fetch a URL and parse its output.
	 * @since 3.1.0
	 * @param url The url to fetch
	 * @param options The options to pass, overloads to type if type is string
	 * @param type The type of expected output
	 */
	// @ts-ignore
	public static async fetch<T extends object>(url: URL | string, type?: 'json'): Promise<T>;
	public static async fetch<T extends object>(url: URL | string, options?: RequestInit, type?: 'json'): Promise<T>;
	public static async fetch(url: URL | string, type?: 'buffer'): Promise<Buffer>;
	public static async fetch(url: URL | string, options?: RequestInit, type?: 'buffer'): Promise<Buffer>;
	public static async fetch(url: URL | string, type?: 'text'): Promise<string>;
	public static async fetch(url: URL | string, options?: RequestInit, type?: 'text'): Promise<string>;
	public static async fetch(url: URL | string, type?: string): Promise<any>;
	public static async fetch<T extends object>(url: URL | string, options?: RequestInit, type?: 'result' | 'json' | 'buffer' | 'text'): Promise<T | Response | Buffer | string> {
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
		const result: Response = await fetch(url, options);
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
	 * @since 3.0.0
	 * @param message The Message to get the content from
	 */
	public static getContent(message: SkyraMessage): string | null {
		if (message.content) return message.content;
		return (message.embeds.length && message.embeds[0].description) || null;
	}

	/**
	 * Get the first image from a message.
	 * @since 3.0.0
	 * @param message The Message to get the image from
	 */
	public static getImage(message: SkyraMessage): string | null {
		if (message.attachments.size) {
			const attachment: MessageAttachment | undefined = message.attachments.find((att) => Util.IMAGE_EXTENSION.test(att.url));
			if (attachment) return attachment.url;
		}
		if (message.embeds.length) {
			const embed: MessageEmbed | undefined = message.embeds.find((emb) => emb.type === 'image');
			if (embed) return embed.url;
		}
		return null;
	}

	// Mute role based utils

	/**
	 * Create the mute role
	 * @since 3.0.0
	 * @param msg The message instance to use as context
	 */
	public static async createMuteRole(msg: SkyraMessage): Promise<Role> {
		if (msg.guild.settings.roles.muted
			&& msg.guild.roles.has(msg.guild.settings.roles.muted)) throw msg.language.get('SYSTEM_GUILD_MUTECREATE_MUTEEXISTS');

		if (msg.guild.roles.size === 250) throw msg.language.get('SYSTEM_GUILD_MUTECREATE_TOOMANYROLES');

		const role: Role = await msg.guild.roles.create(Util.MUTE_ROLE_OPTIONS);
		const { channels } = msg.guild;
		await msg.sendLocale('SYSTEM_GUILD_MUTECREATE_APPLYING', [channels.size, role]);
		const denied: string[] = [];
		let accepted: number = 0;

		for (const channel of channels.values()) { // eslint-disable-line no-restricted-syntax
			await Util._createMuteRolePush(<KlasaGuildChannel> channel, role, denied);
			accepted++;
		}

		const messageEdit2: string = msg.language.get('SYSTEM_GUILD_MUTECREATE_EXCEPTIONS', denied);
		await msg.guild.settings.update('roles.muted', role.id, msg.guild);
		await msg.sendLocale('SYSTEM_GUILD_MUTECREATE_APPLIED', [accepted, messageEdit2, msg.author, role]);
		return role;
	}

	/**
	 * Push the permissions for the muted role into a channel
	 * @since 3.0.0
	 * @param channel The channel to modify
	 * @param role The role to update
	 * @param array The array to push in case it did fail
	 */
	private static async _createMuteRolePush(channel: KlasaGuildChannel, role: Role, array: string[]): Promise<void> {
		if (channel.type === 'category') return;
		try {
			await channel.updateOverwrite(role, Util.MUTE_ROLE_PERMISSIONS[<'text' | 'voice'> channel.type]);
		} catch {
			array.push(channel.toString());
		}
	}

}

type UtilOneToTenKey = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
type UtilOneToTenValue = {
	emoji: string;
	color: number;
};
