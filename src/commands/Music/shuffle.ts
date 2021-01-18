import { requireDj, requireQueueNotEmpty } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { MusicCommand } from '#lib/structures/commands/MusicCommand';
import type { GuildMessage } from '#lib/types/Discord';
import { ApplyOptions } from '@sapphire/decorators';

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
