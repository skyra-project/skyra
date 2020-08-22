import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';
import { TrackData } from 'lavacord';

@ApplyOptions<MusicCommandOptions>({
	description: (language) => language.get('COMMAND_ADD_DESCRIPTION'),
	extendedHelp: (language) => language.get('COMMAND_ADD_EXTENDED'),
	usage: '<song:song|queue:string>',
	flagSupport: true
})
export default class extends MusicCommand {
	public run(message: KlasaMessage, [songs]: [TrackData[] | string]) {
		// if a queue was provided, import it
		if (typeof songs === 'string') return this.client.commands.get('import')!.run(message, [songs]);

		if (!songs || !songs.length) throw message.language.get('MUSICMANAGER_FETCH_NO_MATCHES');
		message.guild!.music.add(message.author.id, songs, this.getContext(message));
	}
}
