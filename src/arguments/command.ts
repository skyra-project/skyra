import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Argument, ArgumentContext, Command } from '@sapphire/framework';

export default class extends Argument<Command> {
	public async run(argument: string, context: ArgumentContext) {
		const found = this.context.client.commands.get(argument.toLowerCase());
		if (found) return this.ok(found);

		throw await context.message.resolveKey(LanguageKeys.Resolvers.InvalidPiece, { name: context.name, piece: 'command' });
	}
}
