import { MusicCommand } from '#lib/structures/MusicCommand';
import { GuildMessage } from '#lib/types/Discord';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { requireDj, requireQueueNotEmpty } from '#utils/Music/Decorators';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<MusicCommand.Options>({
	aliases: ['qc', 'clear'],
	description: LanguageKeys.Commands.Music.ClearDescription,
	extendedHelp: LanguageKeys.Commands.Music.ClearExtended
})
export default class extends MusicCommand {
	@requireQueueNotEmpty()
	@requireDj()
	public async run(message: GuildMessage) {
		const { audio } = message.guild;
		const count = await audio.count();
		await audio.clearTracks();
		return message.sendTranslated(LanguageKeys.Commands.Music.ClearSuccess, [{ count }]);
	}
}
