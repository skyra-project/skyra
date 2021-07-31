import { AudioCommand, RequireDj, RequireMusicPlaying } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types/Discord';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<AudioCommand.Options>({
	description: LanguageKeys.Commands.Music.SeekDescription,
	extendedHelp: LanguageKeys.Commands.Music.SeekExtended
})
export class UserMusicCommand extends AudioCommand {
	@RequireDj()
	@RequireMusicPlaying()
	public async run(message: GuildMessage, args: AudioCommand.Args) {
		const timespan = await args.rest('timespan', { minimum: 0 });
		await message.guild.audio.seek(timespan);
		this.container.client.emit(Events.MusicSongSeekUpdateNotify, message, timespan);
	}
}
