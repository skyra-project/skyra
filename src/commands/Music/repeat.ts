import { MusicCommand } from '@lib/structures/MusicCommand';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends MusicCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['replay'],
			description: language => language.tget('COMMAND_REPEAT_DESCRIPTION')
		});
	}

	public run(message: KlasaMessage) {
		// Toggle the repeat option with its opposite value
		message.guild!.music.setReplay(!message.guild!.music.replay, this.getContext(message));
	}

}
