import { CommandStore, KlasaMessage } from 'klasa';
import { MusicCommand } from '../../lib/structures/MusicCommand';

export default class extends MusicCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.get('COMMAND_PAUSE_DESCRIPTION'),
			music: ['VOICE_PLAYING', 'SAME_VOICE_CHANNEL', 'DJ_MEMBER']
		});
	}

	public async run(message: KlasaMessage) {
		await message.guild!.music.pause();
		return message.sendLocale('COMMAND_PAUSE_SUCCESS');
	}

}
