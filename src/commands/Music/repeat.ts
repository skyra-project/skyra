import { CommandStore, KlasaMessage } from 'klasa';
import { MusicCommand } from '../../lib/structures/MusicCommand';

export default class extends MusicCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['replay'],
			description: language => language.tget('COMMAND_REPEAT_DESCRIPTION')
		});
	}

	public async run(message: KlasaMessage) {
		const isAlreadyRepeating = message.guild!.music.replay;
		// Toggle the repeat option with its opposite value
		message.guild!.music.setReplay(!isAlreadyRepeating);
		// Alert the user whether the replay option was enabled or disabled
		return message.sendLocale('COMMAND_REPEAT_SUCCESS', [!isAlreadyRepeating]);
	}

}
