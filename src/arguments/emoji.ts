import { LanguageKeys } from '#lib/i18n/languageKeys';
import { EmojiObject, getEmojiObject } from '#utils/functions';
import { Argument, ArgumentContext } from '@sapphire/framework';

export class UserArgument extends Argument<EmojiObject> {
	public run(parameter: string, context: ArgumentContext) {
		const resolved = getEmojiObject(parameter);
		if (resolved === null) return this.error({ parameter, identifier: LanguageKeys.Arguments.Emoji, context });
		return this.ok(resolved);
	}
}
