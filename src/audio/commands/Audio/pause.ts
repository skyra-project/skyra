import {
	AudioCommand,
	RequireDj,
	RequireMusicPlaying,
	RequireSameVoiceChannel,
	RequireSkyraInVoiceChannel,
	RequireUserInVoiceChannel
} from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types/Discord';
import { Events } from '#lib/types/Enums';
import { getAudio } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<AudioCommand.Options>({
	description: LanguageKeys.Commands.Music.PauseDescription,
	detailedDescription: LanguageKeys.Commands.Music.PauseExtended
})
export class UserAudioCommand extends AudioCommand {
	@RequireUserInVoiceChannel()
	@RequireSkyraInVoiceChannel()
	@RequireSameVoiceChannel()
	@RequireDj()
	@RequireMusicPlaying()
	public async run(message: GuildMessage) {
		await getAudio(message.guild).pause();
		this.container.client.emit(Events.MusicSongPauseNotify, message);
	}
}
