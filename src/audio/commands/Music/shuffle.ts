import { AudioCommand, RequireDj, RequireQueueNotEmpty } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types/Discord';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<AudioCommand.Options>({
	description: LanguageKeys.Commands.Music.ShuffleDescription,
	extendedHelp: LanguageKeys.Commands.Music.ShuffleExtended
})
export class UserMusicCommand extends AudioCommand {
	@RequireQueueNotEmpty()
	@RequireDj()
	public async run(message: GuildMessage, args: AudioCommand.Args) {
		const { audio } = message.guild;
		await audio.shuffleTracks();

		const amount = await audio.count();
		await message.send(args.t(LanguageKeys.Commands.Music.ShuffleSuccess, { amount }));
	}
}
