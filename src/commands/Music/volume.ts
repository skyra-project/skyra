import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { ApplyOptions } from '@skyra/decorators';
import { requireMusicPlaying, requireSameVoiceChannel, requireSkyraInVoiceChannel, requireUserInVoiceChannel } from '@utils/Music/Decorators';
import { KlasaMessage } from 'klasa';

@ApplyOptions<MusicCommandOptions>({
	aliases: ['vol'],
	description: language => language.tget('COMMAND_VOLUME_DESCRIPTION'),
	usage: '[volume:number]'
})
export default class extends MusicCommand {

	@requireUserInVoiceChannel()
	@requireSkyraInVoiceChannel()
	@requireSameVoiceChannel()
	@requireMusicPlaying()
	public async run(message: KlasaMessage, [volume]: [number]) {
		const { music } = message.guild!;
		const previousVolume = music.volume;

		// If no argument was given
		if (typeof volume === 'undefined' || volume === previousVolume) {
			return message.sendLocale('COMMAND_VOLUME_SUCCESS', [previousVolume]);
		}

		if (music.listeners.length >= 4 && !await music.manageableFor(message)) {
			throw message.language.tget('INHIBITOR_MUSIC_DJ_MEMBER');
		}

		// Set the volume
		await music.setVolume(volume, this.getContext(message));
	}

}
