import { ENABLE_LAVALINK } from '#root/config';
import type { CommandStore } from 'klasa';
import { SkyraCommand } from './SkyraCommand';

export namespace MusicCommand {
	/**
	 * The music command options
	 */
	export type Options = SkyraCommand.Options;
}

export abstract class MusicCommand extends SkyraCommand {
	protected constructor(store: CommandStore, file: string[], directory: string, options: MusicCommand.Options) {
		super(store, file, directory, { ...options, runIn: ['text'] });
	}

	public init() {
		if (!ENABLE_LAVALINK) this.disable();
		return Promise.resolve();
	}
}
