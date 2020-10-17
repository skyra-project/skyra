import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { Track } from '@skyra/audio';
import { ApplyOptions } from '@skyra/decorators';
import { requireUserInVoiceChannel } from '@utils/Music/Decorators';
import { KlasaMessage } from 'klasa';

@ApplyOptions<MusicCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Music.PlayDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Music.PlayExtended),
	usage: '(song:song)',
	flagSupport: true
})
export default class extends MusicCommand {
	@requireUserInVoiceChannel()
	public async run(message: KlasaMessage, [songs]: [Track[]]) {
		const { audio } = message.guild!;

		if (songs) {
			// If there are songs or a queue, add them
			await this.client.commands.get('add')!.run(message, [songs]);
			if (audio.playing) return;
		} else if (!audio.canStart()) {
			return message.sendLocale(LanguageKeys.Commands.Music.PlayQueueEmpty);
		}

		// If Skyra is not in a voice channel, join
		if (!audio.voiceChannelID) {
			await this.client.commands.get('join')!.run(message, []);
		}

		// If Skyra is already playing, send a message.
		if (audio.playing) {
			return message.sendLocale(LanguageKeys.Commands.Music.PlayQueuePlaying);
		}

		const current = await audio.current();
		if (current === null) {
			await audio.textChannelID(message.channel.id);
			await audio.start();
		} else {
			await audio.resume();
			const track = await audio.player.node.decode(current.entry.track);
			await message.sendLocale(LanguageKeys.Commands.Music.PlayQueuePaused, [{ song: `<${track.uri}>` }]);
		}
	}
}
