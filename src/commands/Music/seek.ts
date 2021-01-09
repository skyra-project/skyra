import { MusicCommand } from '#lib/structures/MusicCommand';
import { GuildMessage } from '#lib/types/Discord';
import { Events } from '#lib/types/Enums';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { requireDj, requireMusicPlaying } from '#utils/Music/Decorators';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<MusicCommand.Options>({
	description: LanguageKeys.Commands.Music.SeekDescription,
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
