import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Argument } from '@sapphire/framework';
import type { LocaleString } from 'discord.js';

export class UserArgument extends Argument<LocaleString> {
	public run(parameter: string, context: Argument.Context) {
		const { languages } = this.container.i18n;
		if (languages.has(parameter)) return this.ok(parameter as LocaleString);
		return this.error({ parameter, identifier: LanguageKeys.Arguments.Language, context: { ...context, possibles: [...languages.keys()] } });
	}
}
