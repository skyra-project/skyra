import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';
import { TrackData } from 'lavacord';

@ApplyOptions<MusicCommandOptions>({
	description: language => language.tget('COMMAND_ADD_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_ADD_EXTENDED'),
	usage: '<song:song>',
	flagSupport: true
})
export default class extends MusicCommand {

	public run(message: KlasaMessage, [songs]: [TrackData[]]) {
		if (!songs || !songs.length) throw message.language.tget('MUSICMANAGER_FETCH_NO_MATCHES');
		message.guild!.music.add(message.author.id, songs, this.getContext(message));
	}

}
