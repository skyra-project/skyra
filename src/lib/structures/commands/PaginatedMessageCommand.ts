import { seconds } from '#utils/common';
import type { CommandContext, PieceContext } from '@sapphire/framework';
import type { PermissionResolvable } from 'discord.js';
import { SkyraCommand } from './SkyraCommand';

export abstract class PaginatedMessageCommand extends SkyraCommand {
	public constructor(context: PieceContext, options: PaginatedMessageCommand.Options) {
		super(context, {
			cooldownDelay: seconds(15),
			// Merge in all given options
			...options,
			runIn: ['GUILD_ANY'],
			// Add all requiredPermissions set in the command, along with the permissions required for PaginatedMessage
			requiredClientPermissions: [
				...((options.requiredClientPermissions as PermissionResolvable[] | undefined) ?? []),
				'ADD_REACTIONS',
				'MANAGE_MESSAGES',
				'EMBED_LINKS',
				'READ_MESSAGE_HISTORY'
			]
		});
	}
}

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
