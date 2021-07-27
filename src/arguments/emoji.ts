import { LanguageKeys } from '#lib/i18n/languageKeys';
import { resolveEmoji } from '#utils/util';
import { Argument, ArgumentContext } from '@sapphire/framework';

export class UserArgument extends Argument<string> {
	public run(parameter: string, context: ArgumentContext) {
		const resolved = resolveEmoji(parameter);
		if (resolved === null) return this.error({ parameter, identifier: LanguageKeys.Arguments.Emoji, context });
		return this.ok(resolved);
	}
}
