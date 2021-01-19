import { requireDj, requireSkyraInVoiceChannel } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { MusicCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types/Discord';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<MusicCommand.Options>({
	description: LanguageKeys.Commands.Music.LeaveDescription,
	extendedHelp: LanguageKeys.Commands.Music.LeaveExtended,
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

		return message.sendTranslated(LanguageKeys.Commands.Music.LeaveSuccess, [{ channel: `<#${channelID}>` }]);
	}
}
