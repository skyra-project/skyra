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
			// Add all requiredPermissions set in the command, along EMBED_LINKS to send MessageEmbed's
			requiredClientPermissions: [...((options.requiredClientPermissions as PermissionResolvable[] | undefined) ?? []), 'EMBED_LINKS']
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
