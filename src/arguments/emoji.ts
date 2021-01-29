import { LanguageKeys } from '#lib/i18n/languageKeys';
import { resolveEmoji } from '#utils/util';
import { Argument } from '@sapphire/framework';

export class UserArgument extends Argument<string> {
	public run(parameter: string) {
		const resolved = resolveEmoji(parameter);
		if (resolved === null) return this.error({ parameter, identifier: LanguageKeys.Resolvers.InvalidEmoji });
		return this.ok(resolved);
	}
}
