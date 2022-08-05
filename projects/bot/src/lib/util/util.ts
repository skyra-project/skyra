import type { ImageURLOptions } from '@discordjs/rest';
import { DiscordSnowflake } from '@sapphire/snowflake';
import { parseURL } from '@sapphire/utilities';
import { container } from '@skyra/http-framework';
import type { APIMessage, APIUser } from 'discord-api-types/v10';
import type { Guild } from 'skyra-shared';
import { ZeroWidthSpace } from './constants';

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

export function snowflakeAge(snowflake: string | bigint) {
	return Math.max(Date.now() - DiscordSnowflake.timestampFrom(snowflake), 0);
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
export function getContent(message: APIMessage): string | null {
	if (message.content) return message.content;
	for (const embed of message.embeds) {
		if (embed.description) return embed.description;
		if (embed.fields?.length) return embed.fields[0].value;
	}
	return null;
}

/**
 * Gets all the contents from a message.
 * @param message The Message instance to get all contents from
 */
export function getAllContent(message: APIMessage): string {
	const output: string[] = [];
	if (message.content) output.push(message.content);
	for (const embed of message.embeds) {
		if (embed.author?.name) output.push(embed.author.name);
		if (embed.title) output.push(embed.title);
		if (embed.description) output.push(embed.description);
		for (const field of embed.fields ?? []) output.push(`${field.name}\n${field.value}`);
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
export function getAttachment(message: APIMessage): ImageAttachment | null {
	if (message.attachments.length) {
		const attachment = message.attachments.find((att) => IMAGE_EXTENSION.test(att.url));
		if (attachment) {
			return {
				url: attachment.url,
				proxyURL: attachment.proxy_url,
				height: attachment.height!,
				width: attachment.width!
			};
		}
	}

	for (const embed of message.embeds) {
		if (embed.image) {
			return {
				url: embed.image.url,
				proxyURL: embed.image.proxy_url!,
				height: embed.image.height!,
				width: embed.image.width!
			};
		}

		if (embed.thumbnail) {
			return {
				url: embed.thumbnail.url,
				proxyURL: embed.thumbnail.proxy_url!,
				height: embed.thumbnail.height!,
				width: embed.thumbnail.width!
			};
		}
	}

	return null;
}

/**
 * Get the image url from a message.
 * @param message The Message instance to get the image url from
 */
export function getImage(message: APIMessage): string | null {
	const attachment = getAttachment(message);
	return attachment ? attachment.proxyURL || attachment.url : null;
}

export function getDisplayAvatar(id: string, user: APIUser, options?: Readonly<ImageURLOptions>) {
	if (user.avatar === null) return container.rest.cdn.defaultAvatar(Number(user.discriminator) % 5);
	return container.rest.cdn.avatar(id, user.avatar, options);
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

export function cast<T>(value: unknown): T {
	return value as T;
}
