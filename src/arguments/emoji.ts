import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getEmojiObject, type EmojiObject } from '#utils/functions';
import { Argument } from '@sapphire/framework';

export class UserArgument extends Argument<EmojiObject> {
	public run(parameter: string, context: Argument.Context) {
		const resolved = getEmojiObject(parameter);
		if (resolved === null) return this.error({ parameter, identifier: LanguageKeys.Arguments.EmojiError, context });
		return this.ok(resolved);
	}
}
