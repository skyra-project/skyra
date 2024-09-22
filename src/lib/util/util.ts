import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types';
import { BrandingColors, Urls, ZeroWidthSpace } from '#lib/util/constants';
import { EmbedBuilder } from '@discordjs/builders';
import { isImageAttachment } from '@sapphire/discord.js-utilities';
import { container } from '@sapphire/framework';
import { first } from '@sapphire/iterator-utilities/first';
import { send } from '@sapphire/plugin-editable-commands';
import type { TFunction } from '@sapphire/plugin-i18next';
import { isNullishOrEmpty, tryParseURL, type Nullish } from '@sapphire/utilities';
import {
	GuildMember,
	PermissionFlagsBits,
	StickerFormatType,
	type APIUser,
	type EmbedAuthorData,
	type Guild,
	type GuildChannel,
	type ImageURLOptions,
	type Message,
	type MessageMentionTypes,
	type Snowflake,
	type ThreadChannel,
	type User,
	type UserResolvable
} from 'discord.js';

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

export interface ResolvedImageAttachment {
	url: string;
	proxyURL: string;
	height: number;
	width: number;
}

export function* getImages(message: Message): IterableIterator<string> {
	for (const attachment of message.attachments.values()) {
		if (isImageAttachment(attachment)) yield attachment.proxyURL ?? attachment.url;
	}

	for (const embed of message.embeds) {
		if (embed.image) {
			yield embed.image.proxyURL ?? embed.image.url;
		}

		if (embed.thumbnail) {
			yield embed.thumbnail.proxyURL ?? embed.thumbnail.url;
		}
	}

	for (const sticker of message.stickers.values()) {
		// Skip if the sticker is a lottie sticker:
		if (sticker.format === StickerFormatType.Lottie) continue;

		yield sticker.url;
	}
}

/**
 * Get the image url from a message.
 * @param message The Message instance to get the image url from
 */
export function getImage(message: Message): string | null {
	return first(getImages(message)) ?? null;
}

export function setMultipleEmbedImages(embed: EmbedBuilder, urls: IterableIterator<string>) {
	const embeds = [embed];
	let count = 0;
	for (const url of urls) {
		if (count === 0) {
			embed.setURL(Urls.Website).setImage(url);
		} else {
			embeds.push(new EmbedBuilder().setURL(Urls.Website).setImage(url));

			// We only want to send 4 embeds at most
			if (count === 3) break;
		}

		count++;
	}

	return embeds;
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

export function getDisplayAvatar(user: User | APIUser, options?: Readonly<ImageURLOptions>) {
	if (user.avatar === null) {
		const id = usesPomelo(user) ? Number(BigInt(user.id) >> 22n) % 6 : Number(user.discriminator) % 5;
		return container.client.rest.cdn.defaultAvatar(id);
	}

	return container.client.rest.cdn.avatar(user.id, user.avatar, options);
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
 * Splits a message into multiple messages if it exceeds a certain length, using a specified character as the delimiter.
 * @param content The message to split.
 * @param options The options for splitting the message.
 * @returns An array of messages split from the original message.
 * @throws An error if the content cannot be split.
 */
export function splitMessage(content: string, options: SplitMessageOptions) {
	if (content.length <= options.maxLength) return [content];

	let last = 0;
	const messages = [] as string[];
	while (last < content.length) {
		// If the last chunk can fit the rest of the content, push it and break:
		if (content.length - last <= options.maxLength) {
			messages.push(content.slice(last));
			break;
		}

		// Find the last best index to split the chunk:
		const index = content.lastIndexOf(options.char, options.maxLength + last);
		if (index === -1) throw new Error('Unable to split content.');

		messages.push(content.slice(last, index + 1));
		last = index + 1;
	}

	return messages;
}

export interface SplitMessageOptions {
	char: string;
	maxLength: number;
}

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
	return (channel.guild !== null && channel.permissionsFor(user)?.has(PermissionFlagsBits.ViewChannel)) || false;
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
	const embed = new EmbedBuilder().setDescription(pickRandom(t(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary);
	return send(message, { embeds: [embed] }) as Promise<T>;
};

export function getColor(message: { member?: GuildMember | Nullish }) {
	return message.member?.displayColor ?? BrandingColors.Primary;
}

/**
 * Checks if the provided user ID is the same as the client's ID.
 *
 * @param userId - The user ID to check.
 */
export function isUserSelf(userId: Snowflake) {
	return userId === process.env.CLIENT_ID;
}

export interface MuteOptions {
	reason?: string;
	duration?: number | string | null;
}
