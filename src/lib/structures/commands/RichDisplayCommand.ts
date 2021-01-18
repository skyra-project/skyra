import type { GuildMessage } from '#lib/types';
import type { PermissionResolvable } from 'discord.js';
import { PieceContext } from 'klasa';
import { SkyraCommand } from './SkyraCommand';

export namespace RichDisplayCommand {
	/**
	 * The RichDisplayCommand Options
	 */
	export type Options = SkyraCommand.Options;
}

export abstract class RichDisplayCommand extends SkyraCommand {
	public constructor(context: PieceContext, options: RichDisplayCommand.Options) {
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

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public run(message: GuildMessage, _params: any[]): any {
		return message;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public inhibit(_message: GuildMessage): Promise<boolean> | boolean {
		return false;
	}
}
