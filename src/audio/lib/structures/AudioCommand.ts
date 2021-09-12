import { envParseBoolean } from '#lib/env';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import { CommandOptionsRunTypeEnum, PieceContext } from '@sapphire/framework';

export abstract class AudioCommand extends SkyraCommand {
	protected constructor(context: PieceContext, options: AudioCommand.Options) {
		super(context, {
			...options,
			runIn: [CommandOptionsRunTypeEnum.GuildAny],
			preconditions: ['AudioEnabled'],
			enabled: envParseBoolean('AUDIO_ENABLED')
		});
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
