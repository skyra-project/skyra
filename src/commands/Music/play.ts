import { requireUserInVoiceChannel } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { MusicCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types/Discord';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<MusicCommand.Options>({
	aliases: ['p'],
	description: LanguageKeys.Commands.Music.PlayDescription,
	extendedHelp: LanguageKeys.Commands.Music.PlayExtended,
	usage: '[song:song]',
	flagSupport: true
})
export default class extends MusicCommand {
	@requireUserInVoiceChannel()
	public async run(message: GuildMessage, [songs]: [string[]]) {
		const { audio } = message.guild;

		if (songs) {
			// If there are songs or a queue, add them
			await this.context.client.commands.get('add')!.run(message, [songs]);
			if (audio.playing) return;
		}

		// Retrieve the currently playing track, then check if there is at least one track to be played.
		const current = await audio.getCurrentTrack();
		if (!current && (await audio.count()) === 0) {
			return message.sendTranslated(LanguageKeys.Commands.Music.PlayQueueEmpty);
		}

		// If Skyra is not in a voice channel, join
		if (!audio.voiceChannelID) {
			await this.context.client.commands.get('join')!.run(message, []);
		}

		// If Skyra is already playing, send a message.
		if (audio.playing) {
			return message.sendTranslated(LanguageKeys.Commands.Music.PlayQueuePlaying);
		}

		if (current && audio.paused) {
			await audio.resume();
			const track = await audio.player.node.decode(current.track);
			await message.sendTranslated(LanguageKeys.Commands.Music.PlayQueuePaused, [{ song: `<${track.uri}>` }]);
		} else {
			await audio.setTextChannelID(message.channel.id);
			await audio.start();
		}

		return null;
	}
}
