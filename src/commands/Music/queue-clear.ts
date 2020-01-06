import { MusicCommand } from '@lib/structures/MusicCommand';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends MusicCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['qc', 'clear'],
			description: language => language.tget('COMMAND_CLEAR_DESCRIPTION'),
			music: ['QUEUE_NOT_EMPTY', 'DJ_MEMBER']
		});
	}

	public run(message: KlasaMessage) {
		message.guild!.music.prune(this.getContext(message));
	}

}
