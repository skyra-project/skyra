import { LanguageKeys } from '#lib/i18n/languageKeys';
import { FuzzySearch } from '#utils/Parsers/FuzzySearch';
import { Argument, ArgumentContext, Command } from '@sapphire/framework';

export class UserArgument extends Argument<Command> {
	public async run(parameter: string, context: ArgumentContext) {
		const commands = this.context.stores.get('commands');
		const found = commands.get(parameter.toLowerCase());
		if (found) return this.ok(found);

		const command = await new FuzzySearch(commands, (command) => command.name).run(context.message, parameter, context.minimum);
		if (command) return this.ok(command[1]);

		return this.error({ parameter, identifier: LanguageKeys.Arguments.Command, context });
	}
}
