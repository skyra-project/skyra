import { ENABLE_LAVALINK } from '@root/config';
import { TextChannel } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

import { MusicHandlerRequestContext } from './music/MusicHandler';
import { SkyraCommand, SkyraCommandOptions } from './SkyraCommand';

export abstract class MusicCommand extends SkyraCommand {
	protected constructor(store: CommandStore, file: string[], directory: string, options: MusicCommandOptions = {}) {
		super(store, file, directory, { ...options, runIn: ['text'] });
	}

	public init() {
		if (!ENABLE_LAVALINK) this.disable();
		return Promise.resolve();
	}

	protected getContext(message: KlasaMessage): MusicHandlerRequestContext {
		return { channel: message.channel as TextChannel, userID: message.author.id };
	}
}

/**
 * The music command options
 */
export type MusicCommandOptions = SkyraCommandOptions;
