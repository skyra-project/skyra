import { Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getEmojiString, getEmojiTextFormat, isValidSerializedEmoji, SerializedEmoji } from '#utils/functions';
import type { Awaited } from '@sapphire/utilities';

export class UserSerializer extends Serializer<SerializedEmoji> {
	public async parse(args: Serializer.Args) {
		const result = await args.pickResult('emoji');
		if (!result.success) return this.errorFromArgument(args, result.error);
		return this.ok(getEmojiString(result.value));
	}

	public isValid(value: SerializedEmoji, { t, entry }: SerializerUpdateContext): Awaited<boolean> {
		if (isValidSerializedEmoji(value)) return true;
		throw new Error(t(LanguageKeys.Serializers.InvalidEmoji, { name: entry.name }));
	}

	public stringify(data: SerializedEmoji) {
		return getEmojiTextFormat(data);
	}
}
