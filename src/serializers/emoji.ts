import { Serializer } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getEmojiString, getEmojiTextFormat, isValidSerializedEmoji, type SerializedEmoji } from '#utils/functions';
import type { Awaitable } from '@sapphire/utilities';

export class UserSerializer extends Serializer<SerializedEmoji> {
	public async parse(args: Serializer.Args) {
		const result = await args.pickResult('emoji');
		return result.match({
			ok: (value) => this.ok(getEmojiString(value)),
			err: (error) => this.errorFromArgument(args, error)
		});
	}

	public isValid(value: SerializedEmoji, { t, entry }: Serializer.UpdateContext): Awaitable<boolean> {
		if (isValidSerializedEmoji(value)) return true;
		throw new Error(t(LanguageKeys.Serializers.InvalidEmoji, { name: entry.name }));
	}

	public override stringify(data: SerializedEmoji) {
		return getEmojiTextFormat(data);
	}
}
