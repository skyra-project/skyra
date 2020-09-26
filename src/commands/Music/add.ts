import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import type { KlasaMessage } from 'klasa';
import type { TrackData } from 'lavacord';

@ApplyOptions<MusicCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Music.AddDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Music.AddExtended),
	usage: '<song:song>',
	flagSupport: true
})
export default class extends MusicCommand {
	public run(message: KlasaMessage, [songs]: [TrackData[]]) {
		if (!songs || !songs.length) throw message.language.get(LanguageKeys.MusicManager.FetchNoMatches);
		message.guild!.music.add(message.author.id, songs, this.getContext(message));
	}
}
