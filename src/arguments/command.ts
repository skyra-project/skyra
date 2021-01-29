import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Argument, Command } from '@sapphire/framework';

export class UserArgument extends Argument<Command> {
	public async run(parameter: string) {
		const found = this.context.stores.get('commands').get(parameter.toLowerCase());
		if (found) return this.ok(found);
		return this.error({ parameter, identifier: LanguageKeys.Resolvers.InvalidCommand });
	}
}
