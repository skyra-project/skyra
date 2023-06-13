import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types';
import { send } from '@sapphire/plugin-editable-commands';
import { isNullishOrEmpty, Nullish, tryParseURL } from '@sapphire/utilities';
import type { APIUser } from 'discord-api-types/v9';
import {
	MessageEmbed,
	Permissions,
	type AllowedImageSize,
	type DynamicImageFormat,
	type EmbedAuthorData,
	type Guild,
	type GuildChannel,
	type Message,
	type MessageMentionTypes,
	type ThreadChannel,
	type User,
	type UserResolvable
} from 'discord.js';
import type { TFunction } from 'i18next';
import { BrandingColors, ZeroWidthSpace } from './constants';

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

export function oneToTen(level: number): UtilOneToTenEntry | undefined {
	level |= 0;
	if (level < 0) level = 0;
	else if (level > 10) level = 10;
	return ONE_TO_TEN.get(level);
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

/**
 * Checks whether or not the user uses the new username change, defined by the
 * `discriminator` being `'0'` or in the future, no discriminator at all.
 * @see {@link https://dis.gd/usernames}
 * @param user The user to check.
 */
export function usesPomelo(user: User | APIUser) {
	return isNullishOrEmpty(user.discriminator) || user.discriminator === '0';
}

/**
 * The options used for image URLs, ported from {@link https://github.com/discordjs/discord.js/blob/main/packages/rest/src/lib/CDN.ts}.
 */
export interface AvatarOptions {
	/**
	 * The extension to use for the image URL
	 *
	 * @defaultValue `'webp'`
	 */
	extension?: DynamicImageFormat;
	/**
	 * The size specified in the image URL
	 */
	size?: AllowedImageSize;
	/**
	 * Whether or not to prefer the static version of an image asset.
	 */
	forceStatic?: boolean;
}

const ROOT = 'https://cdn.discordapp.com';
export function getDisplayAvatar(user: User | APIUser, options: AvatarOptions = {}) {
	if (user.avatar === null) {
		const id = (usesPomelo(user) ? (BigInt(user.id) >> 22n) % 6n : Number(user.discriminator) % 5).toString();
		return `${ROOT}/embed/avatars/${id}.png`;
	}

	const extension = !options.forceStatic && user.avatar.startsWith('a_') ? 'gif' : options.extension ?? 'webp';
	const size = typeof options.size === 'undefined' ? '' : `?size=${options.size}`;
	return `${ROOT}/avatars/${user.id}/${user.avatar}.${extension}${size}`;
}

export function getTag(user: User | APIUser) {
	return usesPomelo(user) ? `@${user.username}` : `${user.username}#${user.discriminator}`;
}

export function getEmbedAuthor(user: User | APIUser, url?: string | undefined): EmbedAuthorData {
	return { name: getTag(user), iconURL: getDisplayAvatar(user, { size: 128 }), url };
}

export function getFullEmbedAuthor(user: User | APIUser, url?: string | undefined): EmbedAuthorData {
	return { name: `${getTag(user)} (${user.id})`, iconURL: getDisplayAvatar(user, { size: 128 }), url };
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
	const parsed = tryParseURL(url);
	return parsed && IMAGE_EXTENSION.test(parsed.pathname) ? parsed.href : undefined;
}

/**
 * Clean all mentions from a body of text
 * @param guild The guild for context
 * @param input The input to clean
 * @returns The input cleaned of mentions
 * @license Apache-2.0
 * @copyright 2019 Aura Román
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

export function getColor(message: Message) {
	return message.member?.displayColor ?? BrandingColors.Primary;
}

export interface UtilOneToTenEntry {
	emoji: string;
	color: number;
}

export interface MuteOptions {
	reason?: string;
	duration?: number | string | null;
}
