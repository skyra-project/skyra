import { isNumber } from '@klasa/utils';
import ApiRequest from '@lib/structures/api/ApiRequest';
import ApiResponse from '@lib/structures/api/ApiResponse';
import { APIUserData } from '@lib/types/DiscordAPI';
import { Events } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { UserSettings } from '@lib/types/settings/UserSettings';
import { CLIENT_SECRET } from '@root/config';
import { createFunctionInhibitor } from '@skyra/decorators';
import { Image } from 'canvas';
import { Client, DiscordAPIError, Guild, GuildChannel, ImageSize, ImageURLOptions, Message, Permissions, Role, User, UserResolvable } from 'discord.js';
import { readFile } from 'fs-nextra';
import { KlasaGuild, RateLimitManager, util } from 'klasa';
import { Util } from 'klasa-dashboard-hooks';
import nodeFetch, { RequestInit, Response } from 'node-fetch';
import { UserTag } from './Cache/UserTags';
import { APIErrors, BrandingColors, Time } from './constants';
import { REGEX_UNICODE_BOXNM, REGEX_UNICODE_EMOJI } from './External/rUnicodeEmoji';
import { LeaderboardUser } from './Leaderboard';
import { api } from './Models/Api';

const REGEX_FCUSTOM_EMOJI = /<a?:\w{2,32}:\d{17,18}>/;
const REGEX_PCUSTOM_EMOJI = /a?:\w{2,32}:\d{17,18}/;
const REGEX_PARSED_FCUSTOM_EMOJI = /^a?:[^:]+:\d{17,19}$/;
const REGEX_CUSTOM_EMOJI_PARTS = /^(a?):([^:]+):(\d{17,19})$/;

const ONE_TO_TEN = new Map<number, UtilOneToTenEntry>([
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

export interface ReferredPromise<T> {
	promise: Promise<T>;
	resolve(value?: T): void;
	reject(error?: Error): void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop() { }

export function radians(degrees: number) {
	return degrees * Math.PI / 180;
}

export function showSeconds(duration: number) {
	if (!isNumber(duration)) return '00:00';
	const seconds = Math.floor(duration / Time.Second) % 60;
	const minutes = Math.floor(duration / Time.Minute) % 60;
	let output = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	if (duration >= Time.Hour) {
		const hours = Math.floor(duration / Time.Hour);
		output = `${hours.toString().padStart(2, '0')}:${output}`;
	}

	return output;
}

/**
 * Load an image by its path
 * @param path The path to the image to load
 */
export async function loadImage(path: string) {
	const buffer = await readFile(path);
	const image = new Image();
	image.src = buffer;
	return image;
}

/**
 * Read a stream and resolve to a buffer
 * @param stream The readable stream to read
 */
export async function streamToBuffer(stream: NodeJS.ReadableStream) {
	const data: Buffer[] = [];
	for await (const buffer of stream) data.push(buffer as Buffer);
	return Buffer.concat(data);
}

/**
 * Check if the announcement is correctly set up
 * @param message The message instance to check with
 */
export function announcementCheck(message: Message) {
	const announcementID = message.guild!.settings.get(GuildSettings.Roles.Subscriber);
	if (!announcementID) throw message.language.tget('COMMAND_SUBSCRIBE_NO_ROLE');

	const role = message.guild!.roles.get(announcementID);
	if (!role) throw message.language.tget('COMMAND_SUBSCRIBE_NO_ROLE');

	if (role.position >= message.guild!.me!.roles.highest.position) throw message.language.tget('SYSTEM_HIGHEST_ROLE');
	return role;
}

interface EmojiObject extends EmojiObjectPartial {
	animated: boolean;
}

interface EmojiObjectPartial {
	name: string;
	id: string | null;
}

/**
 * Resolve an emoji
 * @param emoji The emoji to resolve
 */
export function resolveEmoji(emoji: string | EmojiObject) {
	if (typeof emoji === 'string') {
		if (REGEX_FCUSTOM_EMOJI.test(emoji)) return emoji.slice(1, -1);
		if (REGEX_PCUSTOM_EMOJI.test(emoji)) return emoji;
		if (REGEX_UNICODE_BOXNM.test(emoji)) return encodeURIComponent(emoji);
		if (REGEX_UNICODE_EMOJI.test(emoji)) return encodeURIComponent(emoji);
		return null;
	}

	// Safe-guard against https://github.com/discordapp/discord-api-docs/issues/974
	return emoji.id ? `${emoji.animated ? 'a' : ''}:${emoji.name.replace(/~\d+/, '')}:${emoji.id}` : encodeURIComponent(emoji.name);
}

export function displayEmoji(emoji: string) {
	return REGEX_PARSED_FCUSTOM_EMOJI.test(emoji) ? `<${emoji}>` : decodeURIComponent(emoji);
}

export function compareEmoji(emoji: string, matching: string | EmojiObjectPartial) {
	const emojiExecResult = REGEX_CUSTOM_EMOJI_PARTS.exec(emoji);
	// emojiExecResult is only `null` when it's not a custom emoji, thus we'll compare with resolveEmoji
	if (emojiExecResult === null) return emoji === resolveEmoji(typeof matching === 'string' ? matching : { animated: false, ...matching });

	// Compare custom emoji
	if (typeof matching === 'string') {
		const matchingExecResult = REGEX_CUSTOM_EMOJI_PARTS.exec(matching);
		// matchingExecResult is only `null` when it's not a custom emoji, and we're comparing against one, thus return false
		if (matchingExecResult === null) return false;

		return emojiExecResult[2] === matchingExecResult[2].replace(/~\d+/, '') // name
			&& emojiExecResult[3] === matchingExecResult[3]; // id
	}

	return emojiExecResult[2] === matching.name.replace(/~\d+/, '') // name
		&& emojiExecResult[3] === matching.id; // id
}

export function oneToTen(level: number) {
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
export function splitText(str: string, length: number, char = ' ') {
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

export function iteratorAt<T>(iterator: IterableIterator<T>, position: number) {
	let result: IteratorResult<T>;
	while (position-- > 0) {
		result = iterator.next();
		if (result.done) return null;
	}

	result = iterator.next();
	return result.done ? null : result.value;
}

export function iteratorRange<T>(iterator: IterableIterator<T>, position: number, offset: number) {
	let result: IteratorResult<T>;
	while (position-- > 0) {
		result = iterator.next();
		if (result.done) return [];
	}

	const results: T[] = [];
	while (offset-- > 0) {
		result = iterator.next();
		if (result.done) return results;
		results.push(result.value);
	}
	return results;
}

export interface Payload {
	avatar: string | null;
	username: string;
	discriminator: string;
	points: number;
	position: number;
}

export async function fetchAllLeaderboardEntries(client: Client, results: readonly [string, LeaderboardUser][]) {
	const promises: Promise<unknown>[] = [];
	for (const [id, element] of results) {
		if (element.name === null) {
			promises.push(client.userTags.fetchUsername(id).then(username => {
				element.name = username;
			}));
		}
	}
	await Promise.all(promises);

	const payload: Payload[] = [];
	for (const [id, element] of results) {
		const userTag = client.userTags.get(id)!;
		payload.push({
			avatar: userTag.avatar,
			username: userTag.username,
			discriminator: userTag.discriminator,
			points: element.points,
			position: element.position
		});
	}
	return payload;
}

export const enum FetchResultTypes {
	JSON,
	Buffer,
	Text,
	Result
}

export const enum FetchMethods {
	Post = 'POST',
	Get = 'GET',
	Put = 'PUT',
	Delete = 'DELETE'
}

export async function fetch(url: URL | string, type: FetchResultTypes.JSON): Promise<unknown>;
export async function fetch(url: URL | string, options: RequestInit, type: FetchResultTypes.JSON): Promise<unknown>;
export async function fetch(url: URL | string, type: FetchResultTypes.Buffer): Promise<Buffer>;
export async function fetch(url: URL | string, options: RequestInit, type: FetchResultTypes.Buffer): Promise<Buffer>;
export async function fetch(url: URL | string, type: FetchResultTypes.Text): Promise<string>;
export async function fetch(url: URL | string, options: RequestInit, type: FetchResultTypes.Text): Promise<string>;
export async function fetch(url: URL | string, type: FetchResultTypes.Result): Promise<Response>;
export async function fetch(url: URL | string, options: RequestInit, type: FetchResultTypes.Result): Promise<Response>;
export async function fetch(url: URL | string, options: RequestInit, type: FetchResultTypes): Promise<Response | Buffer | string | unknown>;
export async function fetch(url: URL | string, options: RequestInit | FetchResultTypes, type?: FetchResultTypes) {
	if (typeof options === 'undefined') {
		options = {};
		type = FetchResultTypes.JSON;
	} else if (typeof options === 'number') {
		type = options;
		options = {};
	} else if (typeof type === 'undefined') {
		type = FetchResultTypes.JSON;
	}

	const result: Response = await nodeFetch(url, options as RequestInit);
	if (!result.ok) throw new Error(await result.text());

	switch (type) {
		case FetchResultTypes.Result: return result;
		case FetchResultTypes.Buffer: return result.buffer();
		case FetchResultTypes.JSON: return result.json();
		case FetchResultTypes.Text: return result.text();
		default: throw new Error(`Unknown type ${type}`);
	}
}

export async function fetchAvatar(user: User, size: ImageSize = 512): Promise<Buffer> {
	const url = user.avatar ? user.avatarURL({ format: 'png', size })! : user.defaultAvatarURL;
	try {
		return await fetch(url, FetchResultTypes.Buffer);
	} catch (error) {
		throw `Could not download the profile avatar: ${error}`;
	}
}

export async function fetchReactionUsers(client: Client, channelID: string, messageID: string, reaction: string) {
	const users: Set<string> = new Set();
	let rawUsers: APIUserData[] = [];

	// Fetch loop, to get +100 users
	do {
		rawUsers = await api(client)
			.channels(channelID)
			.messages(messageID)
			.reactions(reaction)
			.get({ query: { limit: 100, after: rawUsers.length ? rawUsers[rawUsers.length - 1].id : undefined } }) as APIUserData[];
		for (const user of rawUsers) users.add(user.id);
	} while (rawUsers.length === 100);

	return users;
}

export function twemoji(emoji: string) {
	const r: string[] = [];
	let c = 0;
	let p = 0;
	let i = 0;

	while (i < emoji.length) {
		c = emoji.charCodeAt(i++);
		if (p) {
			r.push((0x10000 + ((p - 0xD800) << 10) + (c - 0xDC00)).toString(16));
			p = 0;
		} else if (c >= 0xD800 && c <= 0xDBFF) {
			p = c;
		} else {
			r.push(c.toString(16));
		}
	}
	return r.join('-');
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

export interface ImageAttachment {
	url: string;
	proxyURL: string;
	height: number;
	width: number;
}

/**
 * Get a image attachment from a message.
 * @param message The Message instance to get the image url from
 */
export function getAttachment(message: Message): ImageAttachment | null {
	if (message.attachments.size) {
		const attachment = message.attachments.find(att => IMAGE_EXTENSION.test(att.url));
		if (attachment) {
			return {
				url: attachment.url,
				proxyURL: attachment.proxyURL,
				height: attachment.height!,
				width: attachment.width!
			};
		}
	}

	for (const embed of message.embeds) {
		if (embed.type === 'image') {
			return {
				url: embed.thumbnail!.url,
				proxyURL: embed.thumbnail!.proxyURL!,
				height: embed.thumbnail!.height!,
				width: embed.thumbnail!.width!
			};
		}
		if (embed.image) {
			return {
				url: embed.image.url,
				proxyURL: embed.image.proxyURL!,
				height: embed.image.height!,
				width: embed.image.width!
			};
		}
	}

	return null;
}

/**
 * Get the image url from a message.
 * @param message The Message instance to get the image url from
 */
export function getImage(message: Message): string | null {
	const attachment = getAttachment(message);
	return attachment ? attachment.proxyURL || attachment.url : null;
}

export function getColor(message: Message) {
	return message.author.settings.get(UserSettings.Color) || (message.member && message.member.displayColor) || BrandingColors.Primary;
}

const ROOT = 'https://cdn.discordapp.com';
export function getDisplayAvatar(id: string, user: UserTag | User | APIUserData, options: ImageURLOptions = {}) {
	if (user.avatar === null) return `${ROOT}/embed/avatars/${Number(user.discriminator) % 5}.png`;
	const format = typeof options.format === 'undefined' ? user.avatar.startsWith('a_') ? 'gif' : 'png' : options.format;
	const size = typeof options.size === 'undefined' ? '' : `?size=${options.size}`;
	return `${ROOT}/avatars/${id}/${user.avatar}.${format}${size}`;
}

/**
 * Create a referred promise
 */
export function createReferPromise<T>() {
	let resolve: (value?: T) => void;
	let reject: (error?: Error) => void;
	const promise: Promise<T> = new Promise((res, rej) => {
		resolve = res;
		reject = rej;
	});

	// noinspection JSUnusedAssignment
	return { promise, resolve: resolve!, reject: reject! };
}

/**
 * Parse a range
 * @param input The input to parse
 * @example
 * parseRange('23..25');
 * // -> [23, 24, 25]
 * @example
 * parseRange('1..3,23..25');
 * // -> [1, 2, 3, 23, 24, 25]
 */
export function parseRange(input: string): number[] {
	const set = new Set<number>();
	for (const subset of input.split(',')) {
		const [, smin, smax] = /(\d+) *\.{2,} *(\d+)/.exec(subset) || [subset, subset, subset];
		let min = Number(smin);
		let max = Number(smax);
		if (min > max) [max, min] = [min, max];

		for (let i = Math.max(1, min); i <= max; ++i) set.add(i);
	}

	return [...set];
}

/**
 * Parses an URL, returns null if invalid.
 * @param url The url to parse
 */
export function parseURL(url: string) {
	try {
		return new URL(url);
	} catch {
		return null;
	}
}

/**
 * Properly rounds up or down a number.
 * Also supports strinsgs using an exponent to indicate large or small numbers.
 * @param num The number to round off
 * @param scale The amount of decimals to retain
 */
export function roundNumber(num: number | string, scale = 0) {
	if (!num.toString().includes('e')) {
		return Number(`${Math.round(Number(`${num}e+${scale}`))}e-${scale}`);
	}
	const arr = `${num}`.split('e');
	let sig = '';

	if (Number(arr[1]) + scale > 0) {
		sig = '+';
	}

	return Number(`${Math.round(Number(`${Number(arr[0])}e${sig}${Number(arr[1]) + scale}`))}e-${scale}`);
}

/**
 * Clean all mentions from a body of text
 * @param guild The guild for context
 * @param input The input to clean
 * @returns The input cleaned of mentions
 */
export function cleanMentions(guild: Guild, input: string) {
	return input
		.replace(/@(here|everyone)/g, '@\u200B$1')
		.replace(/<(@[!&]?|#)(\d{17,19})>/g, (match, type, id) => {
			switch (type) {
				case '@':
				case '@!': {
					const tag = guild.client.userTags.get(id);
					return tag ? `@${tag.username}` : match;
				}
				case '@&': {
					const role = guild.roles.get(id);
					return role ? `@${role.name}` : match;
				}
				case '#': {
					const channel = guild.channels.get(id);
					return channel ? `#${channel.name}` : match;
				}
				default: return match;
			}
		});
}

/**
 * Extracts mentions from a body of text
 * @remark Preserves the mentions in the content, if you want to remove them use `cleanMentions`
 * @param input The input extract mentions from
 * @returns an array of mentions
 */
export const extractMentions = (input: string) => input.match(/@(?:here|everyone)|<(@[!&]?)(\d{17,19})>/g) ?? [];

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

export function inlineCodeblock(input: string) {
	return `\`${input.replace(/ /g, '\u00A0').replace(/`/g, '`\u200B')}\``;
}

export function floatPromise(ctx: { client: Client }, promise: Promise<unknown>) {
	if (util.isThenable(promise)) promise.catch(error => ctx.client.emit(Events.Wtf, error));
}

export function getFromPath(object: Record<string, unknown>, path: string | readonly string[]): unknown {
	if (typeof path === 'string') path = path.split('.');

	let value: unknown = object;
	for (const key of path) {
		value = (value as Record<string, unknown>)[key];
		if (value === null || value === undefined) return value;
	}
	return value;
}

export async function resolveOnErrorCodes<T>(promise: Promise<T>, ...codes: readonly APIErrors[]) {
	try {
		return await promise;
	} catch (error) {
		if (error instanceof DiscordAPIError && codes.includes(error.code)) return null;
		throw error;
	}
}

export type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never;

export interface BidirectionalReplaceOptions<T> {
	onMatch(match: RegExpExecArray): T;
	outMatch(content: string, previous: number, next: number): T;
}

export function bidirectionalReplace<T>(regex: RegExp, content: string, options: BidirectionalReplaceOptions<T>) {
	const results: T[] = [];
	let previous = 0;
	let match: RegExpExecArray | null = null;

	while ((match = regex.exec(content)) !== null) {
		if (previous !== match.index) {
			results.push(options.outMatch(content.slice(previous, match.index), previous, match.index));
		}

		previous = regex.lastIndex;
		results.push(options.onMatch(match));
	}

	if (previous < content.length) results.push(options.outMatch(content.slice(previous), previous, content.length));
	return results;
}

/**
 * @enumerable decorator that sets the enumerable property of a class field to false.
 * @param value
 */
export function enumerable(value: boolean) {
	return (target: unknown, key: string) => {
		Object.defineProperty(target, key, {
			enumerable: value,
			set(this: unknown, val: unknown) {
				Object.defineProperty(this, key, {
					configurable: true,
					enumerable: value,
					value: val,
					writable: true
				});
			}
		});
	};
}

export const authenticated = createFunctionInhibitor(
	(request: ApiRequest) => {
		if (!request.headers.authorization) return false;
		request.auth = Util.decrypt(request.headers.authorization, CLIENT_SECRET);
		return !(!request.auth!.user_id || !request.auth!.token);

	},
	(_request: ApiRequest, response: ApiResponse) => {
		response.error(403);
	}
);

export function ratelimit(bucket: number, cooldown: number, auth = false) {
	const manager = new RateLimitManager(bucket, cooldown);
	const xRateLimitLimit = bucket;
	return createFunctionInhibitor(
		(request: ApiRequest, response: ApiResponse) => {
			const id = (auth ? request.auth!.user_id : request.headers['x-forwarded-for'] || request.connection.remoteAddress) as string;
			const bucket = manager.acquire(id);

			response.setHeader('Date', new Date().toUTCString());
			if (bucket.limited) {
				response.setHeader('Retry-After', bucket.remainingTime.toString());
				return false;
			}

			try {
				bucket.drip();
			} catch { }

			response.setHeader('X-RateLimit-Limit', xRateLimitLimit);
			response.setHeader('X-RateLimit-Remaining', bucket.bucket.toString());
			response.setHeader('X-RateLimit-Reset', bucket.remainingTime.toString());

			return true;
		},
		(_request: ApiRequest, response: ApiResponse) => {
			response.error(429);
		}
	);
}

/**
 * Validates that a user has VIEW_CHANNEL permissions to a channel
 * @param channel The TextChannel to check
 * @param user The user for which to check permission
 * @returns Whether the user has access to the channel
 * @example validateChannelAccess(channel, message.author)
 */
export function validateChannelAccess(channel: GuildChannel, user: UserResolvable) {
	return (channel.guild !== null && channel.permissionsFor(user)?.has(Permissions.FLAGS.VIEW_CHANNEL)) || false;
}

export function getHighestRole(guild: KlasaGuild, roles: readonly string[]) {
	let highest: Role | null = null;
	let position = 0;
	for (const roleID of roles) {
		const role = guild.roles.get(roleID);
		if (typeof role === 'undefined') continue;
		if (role.position > position) {
			highest = role;
			position = role.position;
		}
	}

	return highest;
}

export interface UtilOneToTenEntry {
	emoji: string;
	color: number;
}

export interface MuteOptions {
	reason?: string;
	duration?: number | string | null;
}
