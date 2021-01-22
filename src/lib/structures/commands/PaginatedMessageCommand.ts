import type { PermissionResolvable } from 'discord.js';
import type { PieceContext } from 'klasa';
import { SkyraCommand } from './SkyraCommand';

export abstract class PaginatedMessageCommand extends SkyraCommand {
	public constructor(context: PieceContext, options: PaginatedMessageCommand.Options) {
		super(context, {
			// Merge in all given options
			...options,
			runIn: ['text'],
			// Add all requiredPermissions set in the command, along with the permissions required for UserRichDisplay
			requiredPermissions: [
				...((options.requiredPermissions as PermissionResolvable[] | undefined) ?? []),
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
	 * The RichDisplayCommand Options
	 */
	export type Options = SkyraCommand.Options;
}
