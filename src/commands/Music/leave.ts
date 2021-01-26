import { requireDj, requireSkyraInVoiceChannel } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { MusicCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types/Discord';
import { ApplyOptions } from '@sapphire/decorators';

const flags = ['removeall', 'ra'];

@ApplyOptions<MusicCommand.Options>({
	description: LanguageKeys.Commands.Music.LeaveDescription,
	extendedHelp: LanguageKeys.Commands.Music.LeaveExtended,
	strategyOptions: { flags }
})
export class UserMusicCommand extends MusicCommand {
	@requireSkyraInVoiceChannel()
	@requireDj()
	public async run(message: GuildMessage, args: MusicCommand.Args) {
		const { audio } = message.guild;
		const channelID = audio.voiceChannelID!;

		// Do a full leave and disconnect
		await audio.leave();

		// If --removeall or --ra was provided then also clear the queue
		if (args.getFlags(...flags)) await audio.clear();

		return message.channel.send(args.t(LanguageKeys.Commands.Music.LeaveSuccess, { channel: `<#${channelID}>` }));
	}
}
