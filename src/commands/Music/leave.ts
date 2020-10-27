import { MusicCommand } from '@lib/structures/MusicCommand';
import { GuildMessage } from '@lib/types/Discord';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { requireDj, requireSkyraInVoiceChannel } from '@utils/Music/Decorators';

@ApplyOptions<MusicCommand.Options>({
	description: (language) => language.get(LanguageKeys.Commands.Music.LeaveDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Music.LeaveExtended),
	flagSupport: true
})
export default class extends MusicCommand {
	@requireSkyraInVoiceChannel()
	@requireDj()
	public async run(message: GuildMessage) {
		const { audio } = message.guild;
		const channelID = audio.voiceChannelID!;

		// Do a full leave and disconnect
		await audio.leave();

		// If --removeall or --ra was provided then also clear the queue
		if (Reflect.has(message.flagArgs, 'removeall') || Reflect.has(message.flagArgs, 'ra')) {
			await audio.clear();
		}

		return message.sendLocale(LanguageKeys.Commands.Music.LeaveSuccess, [{ channel: `<#${channelID}>` }]);
	}
}
