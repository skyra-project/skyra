import { AudioCommand, RequireMusicPaused, RequireSameVoiceChannel, RequireSkyraInVoiceChannel, RequireUserInVoiceChannel } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types/Discord';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<AudioCommand.Options>({
	description: LanguageKeys.Commands.Music.ResumeDescription,
	extendedHelp: LanguageKeys.Commands.Music.ResumeExtended
})
export class UserMusicCommand extends AudioCommand {
	@RequireUserInVoiceChannel()
	@RequireSkyraInVoiceChannel()
	@RequireSameVoiceChannel()
	@RequireMusicPaused()
	public async run(message: GuildMessage) {
		await message.guild.audio.resume();
		this.container.client.emit(Events.MusicSongResumeNotify, message);
	}
}
