import { BitFieldResolvable, TextChannel } from 'discord.js';
import { CommandOptions, CommandStore, KlasaMessage } from 'klasa';
import { MusicBitField, MusicBitFieldString } from './MusicBitField';
import { SkyraCommand } from './SkyraCommand';
import { MusicHandlerRequestContext } from './music/MusicHandler';
import { mergeDefault } from '@klasa/utils';

export abstract class MusicCommand extends SkyraCommand {

	/**
	 * Whether this command requires an active VoiceConnection or not
	 */
	public music: MusicBitField;

	protected constructor(store: CommandStore, file: string[], directory: string, options: MusicCommandOptions = {}) {
		// By nature, music commands only run in VoiceChannels, which are in Guilds.
		mergeDefault({ runIn: ['text'], requireMusic: 0 }, options);

		super(store, file, directory, options);
		this.music = new MusicBitField(options.music);
	}

	public init() {
		if (!this.client.lavalink) this.disable();
		return Promise.resolve();
	}

	protected getContext(message: KlasaMessage): MusicHandlerRequestContext {
		return { channel: message.channel as TextChannel, userID: message.author.id };
	}

}

/**
 * The music command options
 */
export interface MusicCommandOptions extends CommandOptions {
	music?: BitFieldResolvable<MusicBitFieldString>;
}
