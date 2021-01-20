import { requireMusicPlaying, requireSameVoiceChannel, requireSkyraInVoiceChannel, requireUserInVoiceChannel } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { MusicCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<MusicCommand.Options>({
	aliases: ['vol'],
	description: LanguageKeys.Commands.Music.VolumeDescription,
	extendedHelp: LanguageKeys.Commands.Music.VolumeExtended,
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
			return message.sendTranslated(LanguageKeys.Commands.Music.VolumeSuccess, [{ volume: previous }]);
		}

		const channel = audio.voiceChannel!;
		if (channel.listeners.length >= 4 && !(await message.member.canManage(channel))) {
			throw await message.resolveKey(LanguageKeys.Inhibitors.MusicDjMember);
		}

		// Set the volume
		await audio.setVolume(volume);
		return this.context.client.emit(Events.MusicSongVolumeUpdateNotify, message, previous, volume);
	}
}
