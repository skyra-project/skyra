import { CommandStore, KlasaMessage } from 'klasa';
import { Track } from 'lavalink';
import { MusicCommand } from '../../lib/structures/MusicCommand';

export default class extends MusicCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.tget('COMMAND_ADD_DESCRIPTION'),
			usage: '<song:song>',
			flagSupport: true
		});
	}

	public run(message: KlasaMessage, [songs]: [Track | Track[]]) {
		if (!songs) throw message.language.tget('MUSICMANAGER_FETCH_NO_ARGUMENTS');
		return message.sendMessage(Array.isArray(songs)
			? message.language.tget('COMMAND_ADD_PLAYLIST', message.guild!.music.add(message.author.id, songs).length)
			: message.language.tget('COMMAND_ADD_SONG', message.guild!.music.add(message.author.id, songs).safeTitle));
	}

}
