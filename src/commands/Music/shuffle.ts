import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { GuildMessage } from '@lib/types/Discord';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { requireDj, requireQueueNotEmpty } from '@utils/Music/Decorators';

@ApplyOptions<MusicCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Music.ShuffleDescription)
})
export default class extends MusicCommand {
	@requireQueueNotEmpty()
	@requireDj()
	public async run(message: GuildMessage) {
		const { audio } = message.guild;
		await audio.shuffle();

		const amount = await audio.length();
		await message.sendLocale(LanguageKeys.Commands.Music.ShuffleSuccess, [{ amount }]);
	}
}
