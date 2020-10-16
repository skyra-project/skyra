import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { requireDj, requireSkyraInVoiceChannel } from '@utils/Music/Decorators';
import { KlasaMessage } from 'klasa';

@ApplyOptions<MusicCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Music.LeaveDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Music.LeaveExtended),
	flagSupport: true
})
export default class extends MusicCommand {
	@requireSkyraInVoiceChannel()
	@requireDj()
	public async run(message: KlasaMessage) {
		const { audio } = message.guild!;

		// Do a full leave and disconnect
		await audio.leave();

		// If --removeall or --ra was provided then also clear the queue
		if (Reflect.has(message.flagArgs, 'removeall') || Reflect.has(message.flagArgs, 'ra')) {
			await audio.clear();
		}
	}
}
