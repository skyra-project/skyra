import { AudioCommand, RequireDj, RequireQueueNotEmpty } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types/Discord';
import { getAudio } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';

@ApplyOptions<AudioCommand.Options>({
	aliases: ['qc', 'clear'],
	description: LanguageKeys.Commands.Music.ClearDescription,
	detailedDescription: LanguageKeys.Commands.Music.ClearExtended
})
export class UserAudioCommand extends AudioCommand {
	@RequireQueueNotEmpty()
	@RequireDj()
	public async run(message: GuildMessage, args: AudioCommand.Args) {
		const audio = getAudio(message.guild);
		const count = await audio.count();
		await audio.clearTracks();

		const content = args.t(LanguageKeys.Commands.Music.ClearSuccess, { count });
		return send(message, content);
	}
}
