import { CommandStore, KlasaMessage } from 'klasa';
import { MusicCommand } from '../../lib/structures/MusicCommand';

export default class extends MusicCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.get('COMMAND_SEEK_DESCRIPTION'),
			music: ['QUEUE_NOT_EMPTY', 'VOICE_PLAYING', 'DJ_MEMBER'],
			usage: '<position:timespan>'
		});
	}

	public async run(message: KlasaMessage, [timespan]: [number]) {
		await message.guild!.music.seek(timespan);
		return message.sendLocale('COMMAND_SEEK_SUCCESS', [timespan]);
	}

}
