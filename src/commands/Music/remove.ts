import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { Events } from '@lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';
import { requireQueueNotEmpty } from '@utils/Music/Decorators';
import { KlasaMessage } from 'klasa';

@ApplyOptions<MusicCommandOptions>({
	description: language => language.tget('COMMAND_REMOVE_DESCRIPTION'),
	usage: '<number:integer>'
})
export default class extends MusicCommand {

	@requireQueueNotEmpty()
	public run(message: KlasaMessage, [index]: [number]) {
		if (index <= 0) throw message.language.tget('COMMAND_REMOVE_INDEX_INVALID');

		const { music } = message.guild!;
		if (index > music.queue.length) throw message.language.tget('COMMAND_REMOVE_INDEX_OUT', music.queue.length);

		// Decrease index by 1 because end-users do not think in zero-based arrays
		index--;

		// Get the song that will be removed
		const song = music.queue[index];

		// If song was requested by someone else and the user is not an admin/DJ then restrict the use of the command
		if (song.requester !== message.author.id && !message.member!.isDJ) {
			throw message.language.tget('COMMAND_REMOVE_DENIED');
		}

		// Splice the song out in-place
		music.queue.splice(index, 1);

		// Tell the websocket of the removed song
		this.client.emit(Events.MusicRemove, music, song, this.getContext(message));
	}

}
