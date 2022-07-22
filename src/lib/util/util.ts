import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types';
import { TwemojiRegex } from '@sapphire/discord.js-utilities';
import { send } from '@sapphire/plugin-editable-commands';
import { DiscordSnowflake } from '@sapphire/snowflake';
import { Time } from '@sapphire/time-utilities';
import { isNullishOrEmpty, isNumber, Nullish, parseURL } from '@sapphire/utilities';
import { getCode, isLetterOrDigit, isWhiteSpace } from '@skyra/char';
import { loadImage, type Image } from 'canvas-constructor/napi-rs';
import type { APIUser } from 'discord-api-types/v9';
import {
	AllowedImageSize,
	Guild,
	GuildChannel,
	ImageURLOptions,
	Message,
	MessageEmbed,
	MessageMentionTypes,
	Permissions,
	ThreadChannel,
	User,
	UserResolvable
} from 'discord.js';
import type { TFunction } from 'i18next';
import type { PathLike } from 'node:fs';
import { FileHandle, readFile } from 'node:fs/promises';
import { BrandingColors, ZeroWidthSpace } from './constants';
import type { LeaderboardUser } from './Leaderboard';

const ONE_TO_TEN = new Map<number, UtilOneToTenEntry>([
	[0, { emoji: '😪', color: 0x5b1100 }],
	[1, { emoji: '😪', color: 0x5b1100 }],
	[2, { emoji: '😫', color: 0xab1100 }],
	[3, { emoji: '😔', color: 0xff2b00 }],
	[4, { emoji: '😒', color: 0xff6100 }],
	[5, { emoji: '😌', color: 0xff9c00 }],
	[6, { emoji: '😕', color: 0xb4bf00 }],
	[7, { emoji: '😬', color: 0x84fc00 }],
	[8, { emoji: '🙂', color: 0x5bf700 }],
	[9, { emoji: '😃', color: 0x24f700 }],
	[10, { emoji: '😍', color: 0x51d4ef }]
]);

/**
 * Image extensions:
 * - bmp
 * - jpg
 * - jpeg
 * - png
 * - gif
 * - webp
 */
export const IMAGE_EXTENSION = /\.(bmp|jpe?g|png|gif|webp)$/i;

/**
 * Media extensions
 * - ...Image extensions
 * - ...Audio extensions
 * - ...Video extensions
 */
export const MEDIA_EXTENSION = /\.(bmp|jpe?g|png|gifv?|web[pm]|wav|mp[34]|ogg)$/i;

export function radians(degrees: number) {
	return (degrees * Math.PI) / 180;
}

export function showSeconds(duration: number): string {
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

export function snowflakeAge(snowflake: string | bigint) {
	return Math.max(Date.now() - DiscordSnowflake.timestampFrom(snowflake), 0);
}

export function oneToTen(level: number): UtilOneToTenEntry | undefined {
	level |= 0;
	if (level < 0) level = 0;
	else if (level > 10) level = 10;
	return ONE_TO_TEN.get(level);
}

export interface Payload {
	avatar: string | null;
	username: string | null;
	discriminator: string | null;
	points: number;
	position: number;
}

export function fetchAllLeaderBoardEntries(guild: Guild, results: readonly [string, LeaderboardUser][]) {
	const members = guild.members.cache;
	const payload: Payload[] = [];
	for (const [id, element] of results) {
		const member = members.get(id);
		if (member === undefined) {
			payload.push({
				avatar: null,
				username: null,
				discriminator: null,
				points: element.points,
				position: element.position
			});
		} else {
			const { user } = member;
			payload.push({
				avatar: user.avatar,
				username: user.username,
				discriminator: user.discriminator,
				points: element.points,
				position: element.position
			});
		}
	}

	return payload;
}

export async function loadImageFromUrl(url: string | URL): Promise<Image> {
	const result = await fetch(url);
	if (result.ok) return loadImage(Buffer.from(await result.arrayBuffer()));
	throw new Error(`${result.status}: ${await result.text()}`);
}

export async function loadImageFromFS(path: PathLike | FileHandle): Promise<Image> {
	const file = await readFile(path);
	return loadImage(file);
}

export function fetchAvatar(user: User, size: AllowedImageSize = 512): Promise<Image> {
	const url = user.avatar ? user.avatarURL({ format: 'png', size })! : user.defaultAvatarURL;
	return loadImageFromUrl(url);
}

export function twemoji(emoji: string) {
	const r: string[] = [];
	let c = 0;
	let p = 0;
	let i = 0;

	while (i < emoji.length) {
		c = emoji.charCodeAt(i++);
		if (p) {
			r.push((0x10000 + ((p - 0xd800) << 10) + (c - 0xdc00)).toString(16));
			p = 0;
		} else if (c >= 0xd800 && c <= 0xdbff) {
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

/**
 * Gets all the contents from a message.
 * @param message The Message instance to get all contents from
 */
export function getAllContent(message: Message): string {
	const output: string[] = [];
	if (message.content) output.push(message.content);
	for (const embed of message.embeds) {
		if (embed.author?.name) output.push(embed.author.name);
		if (embed.title) output.push(embed.title);
		if (embed.description) output.push(embed.description);
		for (const field of embed.fields) output.push(`${field.name}\n${field.value}`);
		if (embed.footer?.text) output.push(embed.footer.text);
	}

	return output.join('\n');
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
		const attachment = message.attachments.find((att) => IMAGE_EXTENSION.test(att.url));
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

const ROOT = 'https://cdn.discordapp.com';
export function getDisplayAvatar(id: string, user: User | APIUser, options: ImageURLOptions = {}) {
	if (user.avatar === null) return `${ROOT}/embed/avatars/${Number(user.discriminator) % 5}.png`;
	const format = typeof options.format === 'undefined' ? (user.avatar.startsWith('a_') ? 'gif' : 'png') : options.format;
	const size = typeof options.size === 'undefined' ? '' : `?size=${options.size}`;
	return `${ROOT}/avatars/${id}/${user.avatar}.${format}${size}`;
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
		const [, stringMin, stringMax] = /(\d+) *\.{2,} *(\d+)/.exec(subset) || [subset, subset, subset];
		let min = Number(stringMin);
		let max = Number(stringMax);
		if (min > max) [max, min] = [min, max];

		for (let i = Math.max(1, min); i <= max; ++i) set.add(i);
	}

	return [...set];
}

/**
 * Parses an URL and checks if the extension is valid.
 * @param url The url to check
 */
export function getImageUrl(url: string): string | undefined {
	const parsed = parseURL(url);
	return parsed && IMAGE_EXTENSION.test(parsed.pathname) ? parsed.href : undefined;
}

/**
 * Clean all mentions from a body of text
 * @param guild The guild for context
 * @param input The input to clean
 * @returns The input cleaned of mentions
 * @license Apache-2.0
 * @copyright 2019 Antonio Román
 */
export function cleanMentions(guild: Guild, input: string) {
	return input.replace(/@(here|everyone)/g, `@${ZeroWidthSpace}$1`).replace(/<(@[!&]?|#)(\d{17,19})>/g, (match, type, id) => {
		switch (type) {
			case '@':
			case '@!': {
				const tag = guild.client.users.cache.get(id);
				return tag ? `@${tag.username}` : `<${type}${ZeroWidthSpace}${id}>`;
			}
			case '@&': {
				const role = guild.roles.cache.get(id);
				return role ? `@${role.name}` : match;
			}
			case '#': {
				const channel = guild.channels.cache.get(id);
				return channel ? `#${channel.name}` : `<${type}${ZeroWidthSpace}${id}>`;
			}
			default:
				return `<${type}${ZeroWidthSpace}${id}>`;
		}
	});
}

export const anyMentionRegExp = /<(@[!&]?|#)(\d{17,19})>/g;
export const hereOrEveryoneMentionRegExp = /@(?:here|everyone)/;

/**
 * Extracts mentions from a body of text.
 * @remark Preserves the mentions in the content, if you want to remove them use `cleanMentions`.
 * @param input The input to extract mentions from.
 */
export function extractDetailedMentions(input: string | Nullish): DetailedMentionExtractionResult {
	const users = new Set<string>();
	const roles = new Set<string>();
	const channels = new Set<string>();
	const parse = [] as MessageMentionTypes[];

	if (isNullishOrEmpty(input)) {
		return { users, roles, channels, parse };
	}

	let result: RegExpExecArray | null;
	while ((result = anyMentionRegExp.exec(input)) !== null) {
		switch (result[1]) {
			case '@':
			case '@!': {
				users.add(result[2]);
				continue;
			}
			case '@&': {
				roles.add(result[2]);
				continue;
			}
			case '#': {
				channels.add(result[2]);
				continue;
			}
		}
	}

	if (hereOrEveryoneMentionRegExp.test(input)) parse.push('everyone');

	return { users, roles, channels, parse };
}

export interface DetailedMentionExtractionResult {
	users: ReadonlySet<string>;
	roles: ReadonlySet<string>;
	channels: ReadonlySet<string>;
	parse: MessageMentionTypes[];
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
 * Picks a random item from an array
 * @param array The array to pick a random item from
 * @example
 * const randomEntry = pickRandom([1, 2, 3, 4]) // 1
 */
export function pickRandom<T>(array: readonly T[]): T {
	const { length } = array;
	return array[Math.floor(Math.random() * length)];
}

export function cast<T>(value: unknown): T {
	return value as T;
}

/**
 * Validates that a user has VIEW_CHANNEL permissions to a channel
 * @param channel The TextChannel to check
 * @param user The user for which to check permission
 * @returns Whether the user has access to the channel
 * @example validateChannelAccess(channel, message.author)
 */
export function validateChannelAccess(channel: GuildChannel | ThreadChannel, user: UserResolvable) {
	return (channel.guild !== null && channel.permissionsFor(user)?.has(Permissions.FLAGS.VIEW_CHANNEL)) || false;
}

/**
 * Fake GraphQL tag that just returns everything passed in as a single combined string
 * @remark used to trick the GraphQL parser into treating some code as GraphQL parsable data for syntax checking
 * @param gqlData data to pass off as GraphQL code
 */
export function gql(...args: any[]): string {
	return args[0].reduce((acc: string, str: string, idx: number) => {
		acc += str;
		if (Reflect.has(args, idx + 1)) acc += args[idx + 1];
		return acc;
	}, '');
}

/**
 * Shuffles an array, returning it
 * @param array The array to shuffle
 */
export const shuffle = <T>(array: T[]): T[] => {
	let m = array.length;
	while (m) {
		const i = Math.floor(Math.random() * m--);
		[array[m], array[i]] = [array[i], array[m]];
	}
	return array;
};

export const random = (num: number) => Math.floor(Math.random() * num);

export const sendLoadingMessage = <T extends GuildMessage | Message>(message: T, t: TFunction): Promise<T> => {
	const embed = new MessageEmbed().setDescription(pickRandom(t(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary);
	return send(message, { embeds: [embed] }) as Promise<T>;
};

/**
 * Gets the base language from an i18n code.
 * @param lang The ISO 639-1 language to process, e.g. `en-US`
 * @returns The base language, for example, `en-US` becomes `en`.
 */
export function baseLanguage(lang: string): string {
	const index = lang.indexOf('-');
	return index === -1 ? lang : lang.slice(0, index);
}

/**
 * Gets the country from an i18n code.
 * @param lang The ISO 639-1 language to process, e.g. `en-US`
 * @returns The country, for example, `en-US` becomes `US`.
 */
export function countryLanguage(lang: string): string {
	const index = lang.lastIndexOf('-');
	return index === -1 ? lang : lang.slice(index + 1);
}

export function sanitizeInput(input: string): string {
	return [...input]
		.map((c) => {
			if (TwemojiRegex.test(c)) return c;

			const code = getCode(c);

			return isLetterOrDigit(code) || isWhiteSpace(code) ? c : '';
		})
		.join('');
}

export interface UtilOneToTenEntry {
	emoji: string;
	color: number;
}

export interface MuteOptions {
	reason?: string;
	duration?: number | string | null;
}
