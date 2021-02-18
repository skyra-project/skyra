import { MusicCommand, requireMusicPaused, requireSameVoiceChannel, requireSkyraInVoiceChannel, requireUserInVoiceChannel } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types/Discord';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<MusicCommand.Options>({
	description: LanguageKeys.Commands.Music.ResumeDescription,
	extendedHelp: LanguageKeys.Commands.Music.ResumeExtended
})
export class UserMusicCommand extends MusicCommand {
	@requireUserInVoiceChannel()
	@requireSkyraInVoiceChannel()
	@requireSameVoiceChannel()
	@requireMusicPaused()
	public async run(message: GuildMessage) {
		await message.guild.audio.resume();
		this.context.client.emit(Events.MusicSongResumeNotify, message);
	}
}
