import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { requireQueueNotEmpty } from '@utils/Music/Decorators';
import { KlasaMessage } from 'klasa';

@ApplyOptions<MusicCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Music.RemoveDescription),
	usage: '<number:integer>'
})
export default class extends MusicCommand {
	@requireQueueNotEmpty()
	public run(message: KlasaMessage, [index]: [number]) {
		if (index <= 0) throw message.language.get(LanguageKeys.Commands.Music.RemoveIndexInvalid);

		const { music } = message.guild!;
		if (index > music.queue.length)
			throw message.language.get(LanguageKeys.Commands.Music.RemoveIndexOut, {
				songs: message.language.get(
					music.queue.length === 1 ? LanguageKeys.Commands.Music.AddPlaylistSongs : LanguageKeys.Commands.Music.AddPlaylistSongsPlural,
					{
						count: music.queue.length
					}
				)
			});

		// Remove the song from the queue
		message.guild!.music.remove(message, index, this.getContext(message));
	}
}
