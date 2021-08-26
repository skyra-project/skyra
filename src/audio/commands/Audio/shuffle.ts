import { AudioCommand, RequireDj, RequireQueueNotEmpty } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types/Discord';
import { getAudio } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';

@ApplyOptions<AudioCommand.Options>({
	description: LanguageKeys.Commands.Music.ShuffleDescription,
	extendedHelp: LanguageKeys.Commands.Music.ShuffleExtended
})
export class UserAudioCommand extends AudioCommand {
	@RequireQueueNotEmpty()
	@RequireDj()
	public async run(message: GuildMessage, args: AudioCommand.Args) {
		const audio = getAudio(message.guild);
		await audio.shuffleTracks();

		const amount = await audio.count();
		const content = args.t(LanguageKeys.Commands.Music.ShuffleSuccess, { amount });
		await send(message, content);
	}
}
