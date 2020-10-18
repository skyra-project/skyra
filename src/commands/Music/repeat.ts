import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { GuildMessage } from '@lib/types/Discord';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { requireMusicPlaying, requireSameVoiceChannel, requireSkyraInVoiceChannel, requireUserInVoiceChannel } from '@utils/Music/Decorators';

@ApplyOptions<MusicCommandOptions>({
	aliases: ['replay'],
	description: (language) => language.get(LanguageKeys.Commands.Music.RepeatDescription)
})
export default class extends MusicCommand {
	@requireUserInVoiceChannel()
	@requireSkyraInVoiceChannel()
	@requireSameVoiceChannel()
	@requireMusicPlaying()
	public async run(message: GuildMessage) {
		// Toggle the repeat option with its opposite value
		await message.guild.audio.replay(!(await message.guild!.audio.replay()));
	}
}
