import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
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
	description: (language) => language.get(LanguageKeys.Commands.Music.PromoteDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Music.PromoteExtended),
	usage: '<number:integer>'
})
export default class extends MusicCommand {
	@requireDj()
	@requireQueueNotEmpty()
	@requireUserInVoiceChannel()
	@requireSkyraInVoiceChannel()
	@requireSameVoiceChannel()
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

		// Promote the song to the top of the queue
		message.guild!.music.promote(index, this.getContext(message));
	}
}
