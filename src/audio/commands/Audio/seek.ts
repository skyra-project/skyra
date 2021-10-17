import { AudioCommand, RequireDj, RequireMusicPlaying, RequireSameVoiceChannel } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types/Discord';
import { Events } from '#lib/types/Enums';
import { getAudio } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<AudioCommand.Options>({
	description: LanguageKeys.Commands.Music.SeekDescription,
	detailedDescription: LanguageKeys.Commands.Music.SeekExtended
})
export class UserAudioCommand extends AudioCommand {
	@RequireDj()
	@RequireMusicPlaying()
	@RequireSameVoiceChannel()
	public async messageRun(message: GuildMessage, args: AudioCommand.Args) {
		const timespan = await args.rest('timespan', { minimum: 0 });
		await getAudio(message.guild).seek(timespan);
		this.container.client.emit(Events.MusicSongSeekUpdateNotify, message, timespan);
	}
}
