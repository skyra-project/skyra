import { MusicCommand, requireUserInVoiceChannel } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types/Discord';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<MusicCommand.Options>({
	description: LanguageKeys.Commands.Music.AddDescription,
	extendedHelp: LanguageKeys.Commands.Music.AddExtended,
	strategyOptions: { flags: ['import', 'sc', 'soundcloud'] }
})
export class UserMusicCommand extends MusicCommand {
	@requireUserInVoiceChannel()
	public async run(message: GuildMessage, args: MusicCommand.Args) {
		const songs = await args.rest('song');
		if (!songs || !songs.length) this.error(LanguageKeys.MusicManager.FetchNoMatches);

		const tracks = songs.map((track) => ({ author: message.author.id, track }));
		await message.guild.audio.add(...tracks);
		this.context.client.emit(Events.MusicAddNotify, message, tracks);
	}
}
