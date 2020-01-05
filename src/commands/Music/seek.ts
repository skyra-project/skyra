import { MusicCommand } from '@lib/structures/MusicCommand';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends MusicCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.tget('COMMAND_SEEK_DESCRIPTION'),
			music: ['QUEUE_NOT_EMPTY', 'VOICE_PLAYING', 'DJ_MEMBER'],
			usage: '<position:timespan>'
		});
	}

	public async run(message: KlasaMessage, [timespan]: [number]) {
		await message.guild!.music.seek(timespan, this.getContext(message));
	}

}
