import { MusicCommand } from '@lib/structures/MusicCommand';
import { GuildMessage } from '@lib/types/Discord';
import { Events } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { requireQueueNotEmpty } from '@utils/Music/Decorators';

@ApplyOptions<MusicCommand.Options>({
	description: (language) => language.get(LanguageKeys.Commands.Music.RemoveDescription),
	usage: '<number:integer>'
})
export default class extends MusicCommand {
	@requireQueueNotEmpty()
	public async run(message: GuildMessage, [index]: [number]) {
		// Minus one as user input is 1-based while the code is 0-based:
		--index;

		if (index < 0) throw message.language.get(LanguageKeys.Commands.Music.RemoveIndexInvalid);

		const { audio } = message.guild;
		const count = await audio.count();
		if (index >= count) {
			throw message.language.get(LanguageKeys.Commands.Music.RemoveIndexOutOfBounds, {
				songs: message.language.get(
					count === 1 ? LanguageKeys.Commands.Music.AddPlaylistSongs : LanguageKeys.Commands.Music.AddPlaylistSongsPlural,
					{
						count
					}
				)
			});
		}

		// Retrieve information about the song to be removed.
		const entry = await audio.getAt(index);

		// Remove the song from the queue.
		await audio.removeAt(index);
		this.client.emit(Events.MusicRemoveNotify, message, entry);
	}
}
