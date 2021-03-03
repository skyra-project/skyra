import { MusicCommand, requireDj, requireMusicPlaying } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types/Discord';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<MusicCommand.Options>({
	description: LanguageKeys.Commands.Music.SeekDescription,
	extendedHelp: LanguageKeys.Commands.Music.SeekExtended
})
export class UserMusicCommand extends MusicCommand {
	@requireDj()
	@requireMusicPlaying()
	public async run(message: GuildMessage, args: MusicCommand.Args) {
		const timespan = await args.rest('timespan', { minimum: 0 });
		await message.guild.audio.seek(timespan);
		this.context.client.emit(Events.MusicSongSeekUpdateNotify, message, timespan);
	}
}
