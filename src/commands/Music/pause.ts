import { requireDj, requireMusicPlaying, requireSameVoiceChannel, requireSkyraInVoiceChannel, requireUserInVoiceChannel } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { MusicCommand } from '#lib/structures/commands/MusicCommand';
import type { GuildMessage } from '#lib/types/Discord';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<MusicCommand.Options>({
	description: LanguageKeys.Commands.Music.PauseDescription,
	extendedHelp: LanguageKeys.Commands.Music.PauseExtended
})
export default class extends MusicCommand {
	@requireUserInVoiceChannel()
	@requireSkyraInVoiceChannel()
	@requireSameVoiceChannel()
	@requireDj()
	@requireMusicPlaying()
	public async run(message: GuildMessage) {
		await message.guild.audio.pause();
		this.context.client.emit(Events.MusicSongPauseNotify, message);
	}
}
