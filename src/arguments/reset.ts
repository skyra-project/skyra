import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Argument, ArgumentContext } from '@sapphire/framework';

export class UserArgument extends Argument<true> {
	public run(parameter: string, context: ArgumentContext) {
		const lowerCasedParameter = parameter.toLowerCase();
		if (context.args.t(LanguageKeys.Arguments.ResetPossibles).includes(lowerCasedParameter)) return this.ok(true);
		return this.error({ parameter, context });
	}
}
