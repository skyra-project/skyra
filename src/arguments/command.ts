import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Argument, ArgumentContext, Command } from '@sapphire/framework';

export class UserArgument extends Argument<Command> {
	public async run(parameter: string, context: ArgumentContext) {
		const found = this.context.stores.get('commands').get(parameter.toLowerCase());
		if (found) return this.ok(found);
		return this.error({ parameter, identifier: LanguageKeys.Arguments.Command, context });
	}
}
