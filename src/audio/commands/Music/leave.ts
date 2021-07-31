import { AudioCommand, RequireDj, RequireSkyraInVoiceChannel } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types/Discord';
import { ApplyOptions } from '@sapphire/decorators';

const flags = ['removeall', 'ra'];

@ApplyOptions<AudioCommand.Options>({
	description: LanguageKeys.Commands.Music.LeaveDescription,
	extendedHelp: LanguageKeys.Commands.Music.LeaveExtended,
	flags
})
export class UserMusicCommand extends AudioCommand {
	@RequireSkyraInVoiceChannel()
	@RequireDj()
	public async run(message: GuildMessage, args: AudioCommand.Args) {
		const { audio } = message.guild;
		const channelId = audio.voiceChannelId!;

		// Do a full leave and disconnect
		await audio.leave();

		// If --removeall or --ra was provided then also clear the queue
		if (args.getFlags(...flags)) await audio.clear();

		return message.send(args.t(LanguageKeys.Commands.Music.LeaveSuccess, { channel: `<#${channelId}>` }));
	}
}
