import { LanguageKeys } from '#lib/i18n/languageKeys';
import { FuzzySearch } from '#utils/Parsers/FuzzySearch';
import { Message } from 'discord.js';
import { Argument, Command, Possible } from 'klasa';

export default class extends Argument {
	public async run(arg: string, possible: Possible, message: Message) {
		const found = this.client.commands.get(arg.toLowerCase());
		if (found) return found;

		const usableCommands = await message.usableCommands();
		const filter = (command: Command) => usableCommands.has(command.name);

		const command = await new FuzzySearch(this.client.commands, (command) => command.name, filter).run(message, arg, possible.min || undefined);
		if (command) return command[1];

		throw await message.resolveKey(LanguageKeys.Resolvers.InvalidPiece, { name: possible.name, piece: 'command' });
	}
}
