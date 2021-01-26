import { requireMusicPlaying, requireSameVoiceChannel, requireSkyraInVoiceChannel, requireUserInVoiceChannel } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { MusicCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<MusicCommand.Options>({
	aliases: ['vol'],
	description: LanguageKeys.Commands.Music.VolumeDescription,
	extendedHelp: LanguageKeys.Commands.Music.VolumeExtended
})
export default class extends MusicCommand {
	@requireUserInVoiceChannel()
	@requireSkyraInVoiceChannel()
	@requireSameVoiceChannel()
	@requireMusicPlaying()
	public async run(message: GuildMessage, args: MusicCommand.Args) {
		const { audio } = message.guild;
		const [previousVolume, newVolume] = await Promise.all([audio.getVolume(), args.pick('integer')]);

		// If no argument was given
		if (typeof newVolume === 'undefined' || newVolume === previousVolume) {
			return message.channel.sendTranslated(LanguageKeys.Commands.Music.VolumeSuccess, [{ volume: previousVolume }]);
		}

		const channel = audio.voiceChannel!;
		if (channel.listeners.length >= 4 && !(await message.member.canManage(channel))) {
			throw await message.resolveKey(LanguageKeys.Inhibitors.MusicDjMember);
		}

		// Set the volume
		await audio.setVolume(newVolume);
		return this.context.client.emit(Events.MusicSongVolumeUpdateNotify, message, previousVolume, newVolume);
	}
}
