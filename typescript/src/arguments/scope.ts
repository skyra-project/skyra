import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Scope } from '#lib/types';
import { Argument, ArgumentContext } from '@sapphire/framework';

export class UserArgument extends Argument<Scope> {
	public run(parameter: string, context: ArgumentContext) {
		const lowerCasedParameter = parameter.toLowerCase();
		if (lowerCasedParameter === context.args.t(LanguageKeys.Arguments.ScopeLocal)) return this.ok(Scope.Local);
		if (lowerCasedParameter === context.args.t(LanguageKeys.Arguments.ScopeGlobal)) return this.ok(Scope.Global);
		return this.error({ parameter, context });
	}
}
