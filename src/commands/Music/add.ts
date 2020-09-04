import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { ApplyOptions } from '@skyra/decorators';
import type { KlasaMessage } from 'klasa';
import type { TrackData } from 'lavacord';

@ApplyOptions<MusicCommandOptions>({
	description: (language) => language.get('commandAddDescription'),
	extendedHelp: (language) => language.get('commandAddExtended'),
	usage: '<song:song>',
	flagSupport: true
})
export default class extends MusicCommand {
	public run(message: KlasaMessage, [songs]: [TrackData[]]) {
		if (!songs || !songs.length) throw message.language.get('musicManagerFetchNoMatches');
		message.guild!.music.add(message.author.id, songs, this.getContext(message));
	}
}
