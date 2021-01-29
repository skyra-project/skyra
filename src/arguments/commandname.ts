import { LanguageKeys } from '#lib/i18n/languageKeys';
import { FuzzySearch } from '#utils/Parsers/FuzzySearch';
import { Argument, ArgumentContext, Command } from '@sapphire/framework';

export class UserArgument extends Argument<Command> {
	public async run(argument: string, { message, minimum }: ArgumentContext) {
		const { commands } = this.context.client;
		const found = commands.get(argument.toLowerCase());
		if (found) return this.ok(found);

		const command = await new FuzzySearch(message.client.commands, (command) => command.name).run(message, argument, minimum);
		if (command) return this.ok(command[1]);

		return this.error(argument, LanguageKeys.Resolvers.InvalidCommand);
	}
}
