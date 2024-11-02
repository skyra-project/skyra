import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { SkyraCommand } from '#lib/structures';
import { PermissionLevels, type NonGroupMessage } from '#lib/types';
import { OWNERS } from '#root/config';
import { FuzzySearch } from '#utils/Parsers/FuzzySearch';
import { Argument, Command } from '@sapphire/framework';

export class UserArgument extends Argument<Command> {
	public async run(parameter: string, context: CommandArgumentContext) {
		const commands = this.container.stores.get('commands');
		const found = commands.get(parameter.toLowerCase()) as SkyraCommand | undefined;
		if (found) {
			return this.isAllowed(found, context) ? this.ok(found) : this.error({ parameter, identifier: LanguageKeys.Arguments.Command, context });
		}

		const command = await new FuzzySearch(commands, (command) => command.name, context.filter).run(
			context.message as NonGroupMessage,
			parameter,
			context.minimum
		);
		if (command) return this.ok(command[1]);

		return this.error({ parameter, identifier: LanguageKeys.Arguments.Command, context });
	}

	private isAllowed(command: SkyraCommand, context: CommandArgumentContext): boolean {
		if (command.permissionLevel !== PermissionLevels.BotOwner) return true;
		return context.owners ?? OWNERS.includes(context.message.author.id);
	}
}

interface CommandArgumentContext extends Argument.Context<Command> {
	filter?: (entry: Command) => boolean;
	owners?: boolean;
}
