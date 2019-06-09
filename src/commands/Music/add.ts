import { CommandStore, KlasaMessage } from 'klasa';
import { Track } from 'lavalink';
import { MusicCommand } from '../../lib/structures/MusicCommand';

export default class extends MusicCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.get('COMMAND_ADD_DESCRIPTION'),
			usage: '<song:song>',
			flagSupport: true
		});
	}

	public async run(message: KlasaMessage, [songs]: [Track | Track[]]) {
		message.guild!.music.add(message.author!.id, songs);
		return message.sendMessage(Array.isArray(songs)
			? message.language.get('COMMAND_ADD_PLAYLIST', songs.length)
			: message.language.get('COMMAND_ADD_SONG', songs.info.title));
	}

}
