import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { Track } from 'lavalink';
import { MusicCommand } from '../../lib/structures/MusicCommand';

export default class extends MusicCommand {

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: (language) => language.get('COMMAND_ADD_DESCRIPTION'),
			usage: '<url:song>'
		});
	}

	public async run(message: KlasaMessage, [songs]: [Track | Track[]]) {
		message.guild.music.add(message.author.id, songs);
		return message.sendMessage(Array.isArray(songs)
			? message.language.get('COMMAND_ADD_PLAYLIST', songs.length)
			: message.language.get('COMMAND_ADD_SONG', songs.info.title));
	}

}
