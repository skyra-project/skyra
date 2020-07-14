import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { ApplyOptions } from '@skyra/decorators';
import { requireDj, requireQueueNotEmpty, requireSameVoiceChannel, requireSkyraInVoiceChannel, requireUserInVoiceChannel } from '@utils/Music/Decorators';
import { KlasaMessage } from 'klasa';

@ApplyOptions<MusicCommandOptions>({
	description: language => language.tget('COMMAND_PROMOTE_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_PROMOTE_EXTENDED'),
	usage: '<number:integer>'
})
export default class extends MusicCommand {

	@requireDj()
	@requireQueueNotEmpty()
	@requireUserInVoiceChannel()
	@requireSkyraInVoiceChannel()
	@requireSameVoiceChannel()
	public run(message: KlasaMessage, [index]: [number]) {
		if (index <= 0) throw message.language.tget('COMMAND_REMOVE_INDEX_INVALID');

		const { music } = message.guild!;
		if (index > music.queue.length) throw message.language.tget('COMMAND_REMOVE_INDEX_OUT', music.queue.length);

		// Promote the song to the top of the queue
		message.guild!.music.promote(index, this.getContext(message));
	}

}
