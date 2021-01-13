import { requireMusicPaused, requireSameVoiceChannel, requireSkyraInVoiceChannel, requireUserInVoiceChannel } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { MusicCommand } from '#lib/structures/commands/MusicCommand';
import { GuildMessage } from '#lib/types/Discord';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<MusicCommand.Options>({
	description: LanguageKeys.Commands.Music.ResumeDescription,
	extendedHelp: LanguageKeys.Commands.Music.ResumeExtended
})
export default class extends MusicCommand {
	@requireUserInVoiceChannel()
	@requireSkyraInVoiceChannel()
	@requireSameVoiceChannel()
	@requireMusicPaused()
	public async run(message: GuildMessage) {
		await message.guild.audio.resume();
		this.client.emit(Events.MusicSongResumeNotify, message);
	}
}
