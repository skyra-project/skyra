import { requireMusicPlaying, requireSameVoiceChannel, requireSkyraInVoiceChannel, requireUserInVoiceChannel } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { MusicCommand } from '#lib/structures/commands/MusicCommand';
import type { GuildMessage } from '#lib/types/Discord';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<MusicCommand.Options>({
	aliases: ['replay'],
	description: LanguageKeys.Commands.Music.RepeatDescription,
	extendedHelp: LanguageKeys.Commands.Music.RepeatExtended
})
export default class extends MusicCommand {
	@requireUserInVoiceChannel()
	@requireSkyraInVoiceChannel()
	@requireSameVoiceChannel()
	@requireMusicPlaying()
	public async run(message: GuildMessage) {
		const { audio } = message.guild;

		// Toggle the repeat option with its opposite value
		const current = await message.guild.audio.getReplay();
		await audio.setReplay(!current);

		this.context.client.emit(Events.MusicReplayUpdateNotify, message, !current);
	}
}
