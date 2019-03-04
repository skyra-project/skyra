import { BitFieldResolvable } from 'discord.js';
import { CommandOptions, CommandStore, KlasaClient, util } from 'klasa';
import { MusicBitField, MusicBitFieldString } from './MusicBitField';
import { SkyraCommand } from './SkyraCommand';

export abstract class MusicCommand extends SkyraCommand {

	/**
	 * Whether this command requires an active VoiceConnection or not
	 */
	public music: MusicBitField;

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string, options: MusicCommandOptions = {}) {
		// By nature, music commands only run in VoiceChannels, which are in Guilds.
		util.mergeDefault({ runIn: ['text'], requireMusic: 0 }, options);

		super(client, store, file, directory, options);
		this.music = new MusicBitField(options.music);
	}

}

/**
 * The music command options
 */
export type MusicCommandOptions = CommandOptions & {
	music?: BitFieldResolvable<MusicBitFieldString>;
};
