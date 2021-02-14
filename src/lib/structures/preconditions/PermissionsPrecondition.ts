import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types';
import { AsyncPreconditionResult, Identifiers, Precondition, PreconditionContext, PreconditionResult } from '@sapphire/framework';
import type { Message } from 'discord.js';
import type { SkyraCommand } from '../commands/SkyraCommand';

export abstract class PermissionsPrecondition extends Precondition {
	public async run(message: Message, command: SkyraCommand, context: PermissionsPrecondition.Context): PermissionsPrecondition.AsyncResult {
		// If not in a guild, skip:
		if (message.guild === null || message.member === null) return this.error({ identifier: Identifiers.PreconditionGuildOnly });
		// Guarded commands cannot be modified:
		if (command.guarded) return this.handle(message as GuildMessage, command, context);
		// If the author is owner of the guild, skip:
		if (message.author.id === message.guild.ownerID) return this.ok();

		const nodes = await message.guild.readSettings((settings) => settings.permissionNodes);
		const result = nodes.run(message.member, command.name);
		if (result) return this.ok();
		if (result === false) return this.error({ identifier: LanguageKeys.Preconditions.PermissionNodes });
		return this.handle(message as GuildMessage, command, context);
	}

	public abstract handle(message: GuildMessage, command: SkyraCommand, context: PermissionsPrecondition.Context): PermissionsPrecondition.Result;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace PermissionsPrecondition {
	export type Context = PreconditionContext;
	export type Result = PreconditionResult;
	export type AsyncResult = AsyncPreconditionResult;
}
