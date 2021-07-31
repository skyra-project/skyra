import { envParseBoolean } from '#lib/env';
import type { PieceContext } from '@sapphire/framework';
import { SkyraCommand } from '../../../lib/structures/commands/SkyraCommand';

export abstract class AudioCommand extends SkyraCommand {
	protected constructor(context: PieceContext, options: AudioCommand.Options) {
		super(context, { ...options, runIn: ['GUILD_ANY'], preconditions: ['AudioEnabled'], enabled: envParseBoolean('AUDIO_ENABLED') });
	}
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AudioCommand {
	/**
	 * The AudioCommand Options
	 */
	export type Options = SkyraCommand.Options;
	/**
	 * The AudioCommand Args
	 */
	export type Args = SkyraCommand.Args;
	export type Context = SkyraCommand.Context;
}
