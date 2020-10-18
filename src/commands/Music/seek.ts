import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { GuildMessage } from '@lib/types/Discord';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { requireDj, requireMusicPlaying } from '@utils/Music/Decorators';

@ApplyOptions<MusicCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Music.SeekDescription),
	usage: '<position:timespan>'
})
export default class extends MusicCommand {
	@requireDj()
	@requireMusicPlaying()
	public async run(message: GuildMessage, [timespan]: [number]) {
		await message.guild.audio.seek(timespan);
	}
}
