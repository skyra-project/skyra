import { MusicCommand } from '@lib/structures/MusicCommand';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends MusicCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.tget('COMMAND_SHUFFLE_DESCRIPTION'),
			music: ['QUEUE_NOT_EMPTY', 'DJ_MEMBER']
		});
	}

	public run(message: KlasaMessage) {
		message.guild!.music.shuffle(this.getContext(message));
	}

}
