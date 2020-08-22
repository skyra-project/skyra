import { FuzzySearch } from '@utils/FuzzySearch';
import { Argument, Command, KlasaMessage, Possible } from 'klasa';

export default class extends Argument {
	public async run(arg: string, possible: Possible, message: KlasaMessage) {
		const found = this.client.commands.get(arg.toLowerCase());
		if (found) return found;

		const usableCommands = await message.usableCommands();
		const filter = (command: Command) => usableCommands.has(command.name);

		const command = await new FuzzySearch(this.client.commands, (command) => command.name, filter).run(message, arg, possible.min || undefined);
		if (command) return command[1];

		throw message.language.get('resolverInvalidPiece', { name: possible.name, piece: 'command' });
	}
}
