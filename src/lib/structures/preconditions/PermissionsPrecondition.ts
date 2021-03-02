import type { GuildMessage } from '#lib/types';
import { AsyncPreconditionResult, Identifiers, Precondition, PreconditionContext, PreconditionResult } from '@sapphire/framework';
import type { SkyraCommand } from '../commands/SkyraCommand';

export abstract class PermissionsPrecondition extends Precondition {
	public async run(message: GuildMessage, command: SkyraCommand, context: PermissionsPrecondition.Context): PermissionsPrecondition.AsyncResult {
		// If not in a guild, resolve on an error:
		if (message.guild === null || message.member === null) return this.error({ identifier: Identifiers.PreconditionGuildOnly });

		// Run the specific precondition's logic:
		return this.handle(message, command, context);
	}

	public abstract handle(message: GuildMessage, command: SkyraCommand, context: PermissionsPrecondition.Context): PermissionsPrecondition.Result;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace PermissionsPrecondition {
	export type Context = PreconditionContext;
	export type Result = PreconditionResult;
	export type AsyncResult = AsyncPreconditionResult;
}
