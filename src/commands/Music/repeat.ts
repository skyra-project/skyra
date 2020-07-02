import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';
import { requireSameVoiceChannel, requireUserInVoiceChannel, requireSkyraInVoiceChannel, requireMusicPlaying } from '@utils/Music/Decorators';

@ApplyOptions<MusicCommandOptions>({
	aliases: ['replay'],
	description: language => language.tget('COMMAND_REPEAT_DESCRIPTION')
})
export default class extends MusicCommand {

	@requireUserInVoiceChannel()
	@requireSkyraInVoiceChannel()
	@requireSameVoiceChannel()
	@requireMusicPlaying()
	public run(message: KlasaMessage) {
		// Toggle the repeat option with its opposite value
		message.guild!.music.setReplay(!message.guild!.music.replay, this.getContext(message));
	}

}
