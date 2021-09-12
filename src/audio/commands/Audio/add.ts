import { AudioCommand, RequireUserInVoiceChannel } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types/Discord';
import { Events } from '#lib/types/Enums';
import { getAudio } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<AudioCommand.Options>({
	description: LanguageKeys.Commands.Music.AddDescription,
	detailedDescription: LanguageKeys.Commands.Music.AddExtended,
	flags: ['import', 'sc', 'soundcloud']
})
export class UserAudioCommand extends AudioCommand {
	@RequireUserInVoiceChannel()
	public async run(message: GuildMessage, args: AudioCommand.Args) {
		const songs = await args.rest('song');
		if (!songs || !songs.length) this.error(LanguageKeys.MusicManager.FetchNoMatches);

		const tracks = songs.map((track) => ({ author: message.author.id, track }));
		await getAudio(message.guild).add(...tracks);
		this.container.client.emit(Events.MusicAddNotify, message, tracks);
	}
}
