import { ENABLE_LAVALINK } from '#root/config';
import { CommandStore } from 'klasa';
import { SkyraCommand, SkyraCommandOptions } from './SkyraCommand';

export abstract class MusicCommand extends SkyraCommand {
	protected constructor(store: CommandStore, file: string[], directory: string, options: MusicCommand.Options = {}) {
		super(store, file, directory, { ...options, runIn: ['text'] });
	}

	public init() {
		if (!ENABLE_LAVALINK) this.disable();
		return Promise.resolve();
	}
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace MusicCommand {
	/**
	 * The music command options
	 */
	export type Options = SkyraCommandOptions;
}
