import { ENABLE_LAVALINK } from '@root/config';
import { CommandStore } from 'klasa';
import { SkyraCommand, SkyraCommandOptions } from './SkyraCommand';

export abstract class MusicCommand extends SkyraCommand {
	protected constructor(store: CommandStore, file: string[], directory: string, options: MusicCommandOptions = {}) {
		super(store, file, directory, { ...options, runIn: ['text'] });
	}

	public init() {
		if (!ENABLE_LAVALINK) this.disable();
		return Promise.resolve();
	}
}

/**
 * The music command options
 */
export type MusicCommandOptions = SkyraCommandOptions;
