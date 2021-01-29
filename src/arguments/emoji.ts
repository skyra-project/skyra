import { LanguageKeys } from '#lib/i18n/languageKeys';
import { resolveEmoji } from '#utils/util';
import { Argument } from '@sapphire/framework';

export class UserArgument extends Argument<string> {
	public run(argument: string) {
		const resolved = resolveEmoji(argument);
		if (resolved === null) return this.error(argument, LanguageKeys.Resolvers.InvalidEmoji);
		return this.ok(resolved);
	}
}
