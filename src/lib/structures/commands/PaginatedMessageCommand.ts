import type { CommandContext, PieceContext } from '@sapphire/framework';
import type { PermissionResolvable } from 'discord.js';
import { SkyraCommand } from './SkyraCommand';

export namespace PaginatedMessageCommand {
	/**
	 * The PaginatedMessageCommand Options
	 */
	export type Options = SkyraCommand.Options;
	/**
	 * The PaginatedMessageCommand Args
	 */
	export type Args = SkyraCommand.Args;

	/**
	 * The PaginatedMessageCommand CommandContext
	 */
	export type Context = CommandContext;
}

export abstract class PaginatedMessageCommand extends SkyraCommand {
	public constructor(context: PieceContext, options: PaginatedMessageCommand.Options) {
		super(context, {
			// Merge in all given options
			...options,
			runIn: ['text'],
			// Add all requiredPermissions set in the command, along with the permissions required for PaginatedMessage
			permissions: [
				...((options.permissions as PermissionResolvable[] | undefined) ?? []),
				'ADD_REACTIONS',
				'MANAGE_MESSAGES',
				'EMBED_LINKS',
				'READ_MESSAGE_HISTORY'
			]
		});
	}
}
