import { CommandMatcher } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { SkyraCommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types';
import { OWNERS } from '#root/config';
import { Argument } from '@sapphire/framework';

export class UserArgument extends Argument<string> {
	public run(parameter: string, context: CommandArgumentContext) {
		const resolved = CommandMatcher.resolve(parameter);
		if (resolved !== null && this.isAllowed(resolved, context)) return this.ok(resolved);
		return this.error({ parameter, identifier: LanguageKeys.Arguments.CommandMatch, context });
	}

	private isAllowed(resolved: string, context: CommandArgumentContext): boolean {
		const command = this.container.stores.get('commands').get(resolved) as SkyraCommand | undefined;
		if (command === undefined) return true;

		if (command.permissionLevel !== PermissionLevels.BotOwner) return true;
		return context.owners ?? OWNERS.includes(context.message.author.id);
	}
}

interface CommandArgumentContext extends Argument.Context<string> {
	owners?: boolean;
}
