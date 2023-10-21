import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Argument } from '@sapphire/framework';

export class UserArgument extends Argument<string> {
	public run(parameter: string, context: Argument.Context) {
		const { languages } = this.container.i18n;
		if (languages.has(parameter)) return this.ok(parameter);
		return this.error({ parameter, identifier: LanguageKeys.Arguments.Language, context: { ...context, possibles: [...languages.keys()] } });
	}
}
