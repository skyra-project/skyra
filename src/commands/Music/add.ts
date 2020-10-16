import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import type { KlasaMessage } from 'klasa';
import type { Track } from '@skyra/audio';
import { map } from '@lib/misc';

@ApplyOptions<MusicCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Music.AddDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Music.AddExtended),
	usage: '<song:song>',
	flagSupport: true
})
export default class extends MusicCommand {
	public async run(message: KlasaMessage, [songs]: [Track[]]) {
		if (!songs || !songs.length) throw message.language.get(LanguageKeys.MusicManager.FetchNoMatches);
		await message.guild!.audio.add(...map(songs.values(), (song) => ({ author: message.author.id, track: song.track })));

		// TODO(kyranet): add message reply
	}
}
