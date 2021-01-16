import { requireDj, requireMusicPlaying } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { MusicCommand } from '#lib/structures/commands/MusicCommand';
import type { GuildMessage } from '#lib/types/Discord';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<MusicCommand.Options>({
	description: LanguageKeys.Commands.Music.SeekDescription,
	extendedHelp: LanguageKeys.Commands.Music.SeekExtended,
	usage: '<position:timespan>'
})
export default class extends MusicCommand {
	@requireDj()
	@requireMusicPlaying()
	public async run(message: GuildMessage, [timespan]: [number]) {
		await message.guild.audio.seek(timespan);
		this.client.emit(Events.MusicSongSeekUpdateNotify, message, timespan);
	}
}
