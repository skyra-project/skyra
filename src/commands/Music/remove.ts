import { CommandStore, KlasaMessage } from 'klasa';
import { MusicCommand } from '../../lib/structures/MusicCommand';

export default class extends MusicCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.tget('COMMAND_REMOVE_DESCRIPTION'),
			music: ['QUEUE_NOT_EMPTY'],
			usage: '<number:integer>'
		});
	}

	public async run(message: KlasaMessage, [index]: [number]) {
		if (index <= 0) throw message.language.tget('COMMAND_REMOVE_INDEX_INVALID');

		const { music } = message.guild!;
		if (index > music.queue.length) throw message.language.tget('COMMAND_REMOVE_INDEX_OUT', music.queue.length);

		index--;
		const song = music.queue[index];
		if (song.requester !== message.author.id && !message.member!.isDJ) {
			throw message.language.tget('COMMAND_REMOVE_DENIED');
		}

		music.queue.splice(index, 1);
		return message.sendLocale('COMMAND_REMOVE_SUCCESS', [song]);
	}

}
