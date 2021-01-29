import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Argument, Command } from '@sapphire/framework';

export class UserArgument extends Argument<Command> {
	public async run(argument: string) {
		const found = this.context.client.commands.get(argument.toLowerCase());
		if (found) return this.ok(found);
		return this.error(argument, LanguageKeys.Resolvers.InvalidCommand);
	}
}
