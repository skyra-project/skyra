import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { requireDj, requireMusicPlaying } from '@utils/Music/Decorators';
import { KlasaMessage } from 'klasa';

@ApplyOptions<MusicCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Music.SeekDescription),
	usage: '<position:timespan>'
})
export default class extends MusicCommand {
	@requireDj()
	@requireMusicPlaying()
	public async run(message: KlasaMessage, [timespan]: [number]) {
		await message.guild!.music.seek(timespan, this.getContext(message));
	}
}
