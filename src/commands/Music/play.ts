import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { GuildMessage } from '@lib/types/Discord';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { requireUserInVoiceChannel } from '@utils/Music/Decorators';

@ApplyOptions<MusicCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Music.PlayDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Music.PlayExtended),
	usage: '[song:song]',
	flagSupport: true
})
export default class extends MusicCommand {
	@requireUserInVoiceChannel()
	public async run(message: GuildMessage, [songs]: [string[]]) {
		const { audio } = message.guild;

		if (songs) {
			// If there are songs or a queue, add them
			await this.client.commands.get('add')!.run(message, [songs]);
			if (audio.playing) return;
		}

		// Retrieve the currently playing track, then check if there is at least one track to be played.
		const current = await audio.current();
		if (!current && (await audio.length()) === 0) {
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

		if (current && audio.paused) {
			await audio.resume();
			const track = await audio.player.node.decode(current.track);
			await message.sendLocale(LanguageKeys.Commands.Music.PlayQueuePaused, [{ song: `<${track.uri}>` }]);
		} else {
			await audio.textChannelID(message.channel.id);
			await audio.start();
		}
	}
}
