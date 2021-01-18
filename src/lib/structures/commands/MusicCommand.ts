import { ENABLE_LAVALINK } from '#root/config';
import { PieceContext } from 'klasa';
import { SkyraCommand } from './SkyraCommand';

export namespace MusicCommand {
	/**
	 * The music command options
	 */
	export type Options = SkyraCommand.Options;
}

export abstract class MusicCommand extends SkyraCommand {
	protected constructor(context: PieceContext, options: MusicCommand.Options) {
		super(context, { ...options, runIn: ['text'] });
		this.enabled = ENABLE_LAVALINK;
	}
}
