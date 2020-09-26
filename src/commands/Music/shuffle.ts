import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { requireDj, requireQueueNotEmpty } from '@utils/Music/Decorators';
import { KlasaMessage } from 'klasa';

@ApplyOptions<MusicCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Music.ShuffleDescription)
})
export default class extends MusicCommand {
	@requireQueueNotEmpty()
	@requireDj()
	public run(message: KlasaMessage) {
		message.guild!.music.shuffle(this.getContext(message));
	}
}
