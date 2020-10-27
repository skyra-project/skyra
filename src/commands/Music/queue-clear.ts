import { MusicCommand } from '@lib/structures/MusicCommand';
import { GuildMessage } from '@lib/types/Discord';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { requireDj, requireQueueNotEmpty } from '@utils/Music/Decorators';

@ApplyOptions<MusicCommand.Options>({
	aliases: ['qc', 'clear'],
	description: (language) => language.get(LanguageKeys.Commands.Music.ClearDescription)
})
export default class extends MusicCommand {
	@requireQueueNotEmpty()
	@requireDj()
	public async run(message: GuildMessage) {
		const { audio } = message.guild;
		const count = await audio.count();
		await audio.clearTracks();
		return message.sendLocale(LanguageKeys.Commands.Music.ClearSuccess, [{ count }]);
	}
}
