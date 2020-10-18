import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { requireMusicPlaying, requireSameVoiceChannel, requireSkyraInVoiceChannel, requireUserInVoiceChannel } from '@utils/Music/Decorators';
import { VoiceChannel } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<MusicCommandOptions>({
	aliases: ['vol'],
	description: (language) => language.get(LanguageKeys.Commands.Music.VolumeDescription),
	usage: '[volume:number]'
})
export default class extends MusicCommand {
	@requireUserInVoiceChannel()
	@requireSkyraInVoiceChannel()
	@requireSameVoiceChannel()
	@requireMusicPlaying()
	public async run(message: KlasaMessage, [volume]: [number]) {
		const { audio } = message.guild!;
		const previousVolume = await audio.volume();

		// If no argument was given
		if (typeof volume === 'undefined' || volume === previousVolume) {
			return message.sendLocale(LanguageKeys.Commands.Music.VolumeSuccess, [{ volume: previousVolume }]);
		}

		const channel = message.guild!.channels.cache.get(audio.voiceChannelID!) as VoiceChannel;
		if (channel.listeners.length >= 4 && !(await message.member!.canManage(channel))) {
			throw message.language.get(LanguageKeys.Inhibitors.MusicDjMember);
		}

		// Set the volume
		await audio.volume(volume);
	}
}
