import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { ApplyOptions } from '@skyra/decorators';
import { requireUserInVoiceChannel } from '@utils/Music/Decorators';
import { KlasaMessage } from 'klasa';
import { TrackData } from 'lavacord';

@ApplyOptions<MusicCommandOptions>({
	description: (language) => language.get('commandPlayDescription'),
	extendedHelp: (language) => language.get('commandPlayExtended'),
	usage: '(song:song)',
	flagSupport: true
})
export default class extends MusicCommand {
	@requireUserInVoiceChannel()
	public async run(message: KlasaMessage, [songs]: [TrackData[]]) {
		const { music } = message.guild!;

		if (songs) {
			// If there are songs or a queue, add them
			await this.client.commands.get('add')!.run(message, [songs]);
			if (music.playing) return;
		} else if (!music.canPlay) {
			await message.sendLocale('commandPlayQueueEmpty');
			return;
		}

		// If Skyra is not in a voice channel, join
		if (!music.voiceChannel) {
			await this.client.commands.get('join')!.run(message, []);
		}

		if (music.playing) {
			await message.sendLocale('commandPlayQueuePlaying');
		} else if (music.song) {
			await music.resume(this.getContext(message));
			await message.sendLocale('commandPlayQueuePaused', [{ song: music.song.toString() }]);
		} else {
			music.channelID = message.channel.id;
			await music.play();
		}
	}
}
