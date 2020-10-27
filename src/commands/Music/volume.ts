import { MusicCommand } from '@lib/structures/MusicCommand';
import { GuildMessage } from '@lib/types';
import { Events } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { requireMusicPlaying, requireSameVoiceChannel, requireSkyraInVoiceChannel, requireUserInVoiceChannel } from '@utils/Music/Decorators';

@ApplyOptions<MusicCommand.Options>({
	aliases: ['vol'],
	description: (language) => language.get(LanguageKeys.Commands.Music.VolumeDescription),
	usage: '[volume:number]'
})
export default class extends MusicCommand {
	@requireUserInVoiceChannel()
	@requireSkyraInVoiceChannel()
	@requireSameVoiceChannel()
	@requireMusicPlaying()
	public async run(message: GuildMessage, [volume]: [number]) {
		const { audio } = message.guild;
		const previous = await audio.getVolume();

		// If no argument was given
		if (typeof volume === 'undefined' || volume === previous) {
			return message.sendLocale(LanguageKeys.Commands.Music.VolumeSuccess, [{ volume: previous }]);
		}

		const channel = audio.voiceChannel!;
		if (channel.listeners.length >= 4 && !(await message.member.canManage(channel))) {
			throw message.language.get(LanguageKeys.Inhibitors.MusicDjMember);
		}

		// Set the volume
		await audio.setVolume(volume);
		this.client.emit(Events.MusicSongVolumeUpdateNotify, message, previous, volume);
	}
}
