import { MusicCommand, requireDj, requireQueueNotEmpty } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types/Discord';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<MusicCommand.Options>({
	description: LanguageKeys.Commands.Music.ShuffleDescription,
	extendedHelp: LanguageKeys.Commands.Music.ShuffleExtended
})
export class UserMusicCommand extends MusicCommand {
	@requireQueueNotEmpty()
	@requireDj()
	public async run(message: GuildMessage, args: MusicCommand.Args) {
		const { audio } = message.guild;
		await audio.shuffleTracks();

		const amount = await audio.count();
		await message.channel.send(args.t(LanguageKeys.Commands.Music.ShuffleSuccess, { amount }));
	}
}
