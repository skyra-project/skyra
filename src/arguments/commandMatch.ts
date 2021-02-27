import { CommandMatcher } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Argument, ArgumentContext } from '@sapphire/framework';

export class UserArgument extends Argument<string> {
	public async run(parameter: string, context: ArgumentContext) {
		const resolved = CommandMatcher.resolve(parameter);
		if (resolved) return this.ok(resolved);
		return this.error({ parameter, identifier: LanguageKeys.Arguments.CommandMatch, context });
	}
}
