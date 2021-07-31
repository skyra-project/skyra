import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Argument, ArgumentContext } from '@sapphire/framework';

export class UserArgument extends Argument<string> {
	public async run(parameter: string, context: ArgumentContext) {
		const { languages } = this.container.client.i18n;
		if (languages.has(parameter)) return this.ok(parameter);
		return this.error({ parameter, identifier: LanguageKeys.Arguments.Language, context: { ...context, possibles: [...languages.keys()] } });
	}
}
