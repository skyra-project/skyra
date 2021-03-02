import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { AsyncPreconditionResult, Identifiers, Precondition, PreconditionContext, PreconditionResult } from '@sapphire/framework';
import type { SkyraCommand } from '../commands/SkyraCommand';

export abstract class PermissionsPrecondition extends Precondition {
	public async run(message: GuildMessage, command: SkyraCommand, context: PermissionsPrecondition.Context): PermissionsPrecondition.AsyncResult {
		// If not in a guild, resolve on an error:
		if (message.guild === null || message.member === null) return this.error({ identifier: Identifiers.PreconditionGuildOnly });

		// If it should skip, go directly to handle:
		if (this.shouldRun(message, command)) {
			const nodes = await message.guild.readSettings((settings) => settings.permissionNodes);
			const result = nodes.run(message.member, command);
			if (result) return this.ok();
			if (result === false) return this.error({ identifier: LanguageKeys.Preconditions.PermissionNodes });
		}

		// Run the specific precondition's logic:
		return this.handle(message, command, context);
	}

	public abstract handle(message: GuildMessage, command: SkyraCommand, context: PermissionsPrecondition.Context): PermissionsPrecondition.Result;

	private shouldRun(message: GuildMessage, command: SkyraCommand) {
		// Guarded commands cannot be modified:
		if (command.guarded) return false;
		// Bot-owner commands cannot be modified:
		if (command.permissionLevel === PermissionLevels.BotOwner) return false;
		// If the author is owner of the guild, skip:
		if (message.author.id === message.guild.ownerID) return false;
		// In any other case, permission nodes should always run:
		return true;
	}
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace PermissionsPrecondition {
	export type Context = PreconditionContext;
	export type Result = PreconditionResult;
	export type AsyncResult = AsyncPreconditionResult;
}
