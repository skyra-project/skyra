import { ENABLE_LAVALINK } from '#root/config';
import type { PieceContext } from '@sapphire/framework';
import { SkyraCommand } from './SkyraCommand';

export namespace MusicCommand {
	/**
	 * The MusicCommand Options
	 */
	export type Options = SkyraCommand.Options;
	/**
	 * The MusicCommand Args
	 */
	export type Args = SkyraCommand.Args;
}

export abstract class MusicCommand extends SkyraCommand {
	protected constructor(context: PieceContext, options: MusicCommand.Options) {
		super(context, { ...options, runIn: ['text'], enabled: ENABLE_LAVALINK });
	}
}
