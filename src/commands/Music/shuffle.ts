import { MusicCommand } from '#lib/structures/MusicCommand';
import { GuildMessage } from '#lib/types/Discord';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { requireDj, requireQueueNotEmpty } from '#utils/Music/Decorators';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<MusicCommand.Options>({
	description: LanguageKeys.Commands.Music.ShuffleDescription,
	extendedHelp: LanguageKeys.Commands.Music.ShuffleExtended
})
export default class extends MusicCommand {
	@requireQueueNotEmpty()
	@requireDj()
	public async run(message: GuildMessage) {
		const { audio } = message.guild;
		await audio.shuffleTracks();

		const amount = await audio.count();
		await message.sendTranslated(LanguageKeys.Commands.Music.ShuffleSuccess, [{ amount }]);
	}
}
