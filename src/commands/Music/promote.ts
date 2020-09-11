import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { ApplyOptions } from '@skyra/decorators';
import {
	requireDj,
	requireQueueNotEmpty,
	requireSameVoiceChannel,
	requireSkyraInVoiceChannel,
	requireUserInVoiceChannel
} from '@utils/Music/Decorators';
import { KlasaMessage } from 'klasa';

@ApplyOptions<MusicCommandOptions>({
	description: (language) => language.get('commandPromoteDescription'),
	extendedHelp: (language) => language.get('commandPromoteExtended'),
	usage: '<number:integer>'
})
export default class extends MusicCommand {
	@requireDj()
	@requireQueueNotEmpty()
	@requireUserInVoiceChannel()
	@requireSkyraInVoiceChannel()
	@requireSameVoiceChannel()
	public run(message: KlasaMessage, [index]: [number]) {
		if (index <= 0) throw message.language.get('commandRemoveIndexInvalid');

		const { music } = message.guild!;
		if (index > music.queue.length)
			throw message.language.get('commandRemoveIndexOut', {
				songs: message.language.get(music.queue.length === 1 ? 'commandAddPlaylistSongs' : 'commandAddPlaylistSongsPlural', {
					count: music.queue.length
				})
			});

		// Promote the song to the top of the queue
		message.guild!.music.promote(index, this.getContext(message));
	}
}
