import { AudioCommand, RequireMusicPlaying, RequireSameVoiceChannel, RequireSkyraInVoiceChannel, RequireUserInVoiceChannel } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types/Discord';
import { Events } from '#lib/types/Enums';
import { getAudio } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<AudioCommand.Options>({
	aliases: ['replay', 'loop', 'loopsong'],
	description: LanguageKeys.Commands.Music.RepeatDescription,
	extendedHelp: LanguageKeys.Commands.Music.RepeatExtended
})
export class UserMusicCommand extends AudioCommand {
	@RequireUserInVoiceChannel()
	@RequireSkyraInVoiceChannel()
	@RequireSameVoiceChannel()
	@RequireMusicPlaying()
	public async run(message: GuildMessage) {
		const audio = getAudio(message.guild);

		// Toggle the repeat option with its opposite value
		const current = await audio.getReplay();
		await audio.setReplay(!current);

		this.container.client.emit(Events.MusicReplayUpdateNotify, message, !current);
	}
}
