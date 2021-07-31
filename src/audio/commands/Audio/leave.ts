import { AudioCommand, RequireDj, RequireSkyraInVoiceChannel } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types/Discord';
import { getAudio } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';

const flags = ['removeall', 'ra'];

@ApplyOptions<AudioCommand.Options>({
	description: LanguageKeys.Commands.Music.LeaveDescription,
	extendedHelp: LanguageKeys.Commands.Music.LeaveExtended,
	flags
})
export class UserAudioCommand extends AudioCommand {
	@RequireSkyraInVoiceChannel()
	@RequireDj()
	public async run(message: GuildMessage, args: AudioCommand.Args) {
		const audio = getAudio(message.guild);
		const channelId = audio.voiceChannelId!;

		// Do a full leave and disconnect
		await audio.leave();

		// If --removeall or --ra was provided then also clear the queue
		if (args.getFlags(...flags)) await audio.clear();

		const content = args.t(LanguageKeys.Commands.Music.LeaveSuccess, { channel: `<#${channelId}>` });
		return send(message, content);
	}
}
