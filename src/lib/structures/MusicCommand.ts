import { BitFieldResolvable } from 'discord.js';
import { CommandOptions, CommandStore, util } from 'klasa';
import { MusicBitField, MusicBitFieldString } from './MusicBitField';
import { SkyraCommand } from './SkyraCommand';

export abstract class MusicCommand extends SkyraCommand {

	/**
	 * Whether this command requires an active VoiceConnection or not
	 */
	public music: MusicBitField;

	public constructor(store: CommandStore, file: string[], directory: string, options: MusicCommandOptions = {}) {
		// By nature, music commands only run in VoiceChannels, which are in Guilds.
		util.mergeDefault({ runIn: ['text'], requireMusic: 0 }, options);

		super(store, file, directory, options);
		this.music = new MusicBitField(options.music);
	}

	public init() {
		if (!this.client.lavalink) this.disable();
		return Promise.resolve();
	}

}

/**
 * The music command options
 */
export interface MusicCommandOptions extends CommandOptions {
	music?: BitFieldResolvable<MusicBitFieldString>;
}
