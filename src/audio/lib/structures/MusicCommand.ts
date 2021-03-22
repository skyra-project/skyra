import { envParseBoolean } from '#lib/env';
import type { PieceContext } from '@sapphire/framework';
import { SkyraCommand } from '../../../lib/structures/commands/SkyraCommand';

export abstract class MusicCommand extends SkyraCommand {
	protected constructor(context: PieceContext, options: MusicCommand.Options) {
		super(context, { ...options, runIn: ['text'], preconditions: ['AudioEnabled'], enabled: envParseBoolean('AUDIO_ENABLED') });
	}
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace MusicCommand {
	/**
	 * The MusicCommand Options
	 */
	export type Options = SkyraCommand.Options;
	/**
	 * The MusicCommand Args
	 */
	export type Args = SkyraCommand.Args;
	export type Context = SkyraCommand.Context;
}
