import { AudioCommand, RequireDj, RequireQueueNotEmpty } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types/Discord';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<AudioCommand.Options>({
	aliases: ['qc', 'clear'],
	description: LanguageKeys.Commands.Music.ClearDescription,
	extendedHelp: LanguageKeys.Commands.Music.ClearExtended
})
export class UserMusicCommand extends AudioCommand {
	@RequireQueueNotEmpty()
	@RequireDj()
	public async run(message: GuildMessage, args: AudioCommand.Args) {
		const { audio } = message.guild;
		const count = await audio.count();
		await audio.clearTracks();
		return message.send(args.t(LanguageKeys.Commands.Music.ClearSuccess, { count }));
	}
}
