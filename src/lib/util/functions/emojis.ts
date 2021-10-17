import { formatEmoji } from '@discordjs/builders';
import { FormattedCustomEmojiWithGroups, TwemojiRegex } from '@sapphire/discord-utilities';
import { isNullish } from '@sapphire/utilities';

interface EmojiObjectPartial {
	name: string | null;
	id: string | null;
}

export interface EmojiObject extends EmojiObjectPartial {
	animated?: boolean;
}

export type SerializedEmoji = string & { __TYPE__: 'SerializedEmoji' };

const customEmojiRegExp = /^[as]\d{17,19}$/;

/**
 * Checks whether or not the emoji is a valid twemoji.
 * @param emoji The emoji to validate.
 */
export function isValidTwemoji(emoji: string) {
	return TwemojiRegex.test(emoji);
}

/**
 * Checks whether or not the emoji is a valid serialized twemoji. This method is an alias of {@link isValidTwemoji} with
 * {@link decodeURIComponent}.
 * @param emoji The emoji to validate.
 */
export function isValidSerializedTwemoji(emoji: string): emoji is SerializedEmoji {
	return isValidTwemoji(decodeURIComponent(emoji));
}

/**
 * Checks whether or not the emoji is a valid serialized custom emoji. Checks whether it starts with either `a` or `s`,
 * followed by 17 to 19 numeric digits.
 * @param emoji The emoji to validate.
 */
export function isValidSerializedCustomEmoji(emoji: string): emoji is SerializedEmoji {
	return customEmojiRegExp.test(emoji);
}

export function isValidSerializedEmoji(emoji: string): emoji is SerializedEmoji {
	return isSerializedTwemoji(emoji as SerializedEmoji) ? isValidSerializedTwemoji(emoji) : isValidSerializedCustomEmoji(emoji);
}

/**
 * Checks whether a serialized emoji is a serialized twemoji.
 * @param emoji Checks whether or not the serialized emoji is a serialized twemoji.
 */
export function isSerializedTwemoji(emoji: SerializedEmoji) {
	return emoji.includes('%');
}

/**
 * Gets the ID of the emoji.
 * This is the input for URL encoded Twemojis or the ID of the emoji for custom ones
 */
export function getEmojiId(emoji: SerializedEmoji): string {
	return isSerializedTwemoji(emoji) ? emoji : emoji.slice(1);
}

/**
 * Formats an emoji so it can be displayed in a Discord message.
 */
export function getEmojiTextFormat(emoji: SerializedEmoji): string {
	return isSerializedTwemoji(emoji) ? decodeURIComponent(emoji) : formatEmoji(emoji.slice(1), emoji.startsWith('a') as true | undefined);
}

/**
 * Formats an emoji in the format that we can use to for reactions on Discord messages.
 */
export function getEmojiReactionFormat(emoji: SerializedEmoji): string {
	return isSerializedTwemoji(emoji) ? emoji : `_:${emoji.slice(1)}`;
}

/**
 * Formats an emoji in the format that we can store in the database.
 */
export function getEmojiString(emoji: EmojiObject): SerializedEmoji {
	if (emoji.id) return `${emoji.animated ? 'a' : 's'}${emoji.id}` as SerializedEmoji;
	return encodeURIComponent(emoji.name!) as SerializedEmoji;
}

/**
 * Formats an emoji into an {@link EmojiObject}.
 */
export function getEmojiObject(emoji: string): EmojiObject | null {
	if (isValidTwemoji(emoji)) {
		return {
			name: emoji,
			id: null
		};
	}

	const emojiProperties = FormattedCustomEmojiWithGroups.exec(emoji)!;

	if (isNullish(emojiProperties?.groups)) return null;

	return {
		name: emojiProperties.groups.name,
		id: emojiProperties.groups.id,
		animated: Boolean(emojiProperties.groups.animated)
	};
}

/**
 * Resolves an emoji either from a database emoji, or a Discord {@link EmojiObject}.
 */
export function resolveEmojiId(emoji: EmojiObject | SerializedEmoji): string {
	if (isNullish(emoji)) return '';

	return typeof emoji === 'string' ? getEmojiId(emoji) : emoji.id ?? encodeURIComponent(emoji.name!);
}

/**
 * Compared whether the identifiers for both emojis are the same, ignoring name and animated.
 */
export function areEmojisEqual(a: EmojiObject | SerializedEmoji, b: EmojiObject | SerializedEmoji) {
	return resolveEmojiId(a) === resolveEmojiId(b);
}
