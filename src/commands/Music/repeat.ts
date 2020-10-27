import { MusicCommand } from '@lib/structures/MusicCommand';
import { GuildMessage } from '@lib/types/Discord';
import { Events } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { requireMusicPlaying, requireSameVoiceChannel, requireSkyraInVoiceChannel, requireUserInVoiceChannel } from '@utils/Music/Decorators';

@ApplyOptions<MusicCommand.Options>({
	aliases: ['replay'],
	description: (language) => language.get(LanguageKeys.Commands.Music.RepeatDescription)
})
export default class extends MusicCommand {
	@requireUserInVoiceChannel()
	@requireSkyraInVoiceChannel()
	@requireSameVoiceChannel()
	@requireMusicPlaying()
	public async run(message: GuildMessage) {
		const { audio } = message.guild;

		// Toggle the repeat option with its opposite value
		const current = await message.guild!.audio.getReplay();
		await audio.setReplay(!current);

		this.client.emit(Events.MusicReplayUpdateNotify, message, !current);
	}
}
