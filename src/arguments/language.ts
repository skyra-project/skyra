import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Argument, ArgumentContext } from '@sapphire/framework';

export class UserArgument extends Argument<string> {
	public async run(parameter: string, context: ArgumentContext) {
		if (this.context.client.i18n.languages.has(parameter)) return this.ok(parameter);
		return this.error({ parameter, identifier: LanguageKeys.Arguments.Language, context });
	}
}
