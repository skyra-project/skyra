import { CommandStore, KlasaMessage } from 'klasa';
import { MusicCommand } from '../../lib/structures/MusicCommand';

export default class extends MusicCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.get('COMMAND_SHUFFLE_DESCRIPTION'),
			music: ['QUEUE_NOT_EMPTY', 'DJ_MEMBER']
		});
	}

	public async run(message: KlasaMessage) {
		const amount = message.guild!.music.shuffle().length;
		return message.sendLocale('COMMAND_SHUFFLE_SUCCESS', [amount]);
	}

}
