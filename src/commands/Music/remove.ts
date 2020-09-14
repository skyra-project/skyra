import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { ApplyOptions } from '@skyra/decorators';
import { requireQueueNotEmpty } from '@utils/Music/Decorators';
import { KlasaMessage } from 'klasa';

@ApplyOptions<MusicCommandOptions>({
	description: (language) => language.get('commandRemoveDescription'),
	usage: '<number:integer>'
})
export default class extends MusicCommand {
	@requireQueueNotEmpty()
	public run(message: KlasaMessage, [index]: [number]) {
		if (index <= 0) throw message.language.get('commandRemoveIndexInvalid');

		const { music } = message.guild!;
		if (index > music.queue.length)
			throw message.language.get('commandRemoveIndexOut', {
				songs: message.language.get(music.queue.length === 1 ? 'commandAddPlaylistSongs' : 'commandAddPlaylistSongsPlural', {
					count: music.queue.length
				})
			});

		// Remove the song from the queue
		message.guild!.music.remove(message, index, this.getContext(message));
	}
}
