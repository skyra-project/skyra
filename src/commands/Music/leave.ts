import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { ApplyOptions } from '@skyra/decorators';
import { requireDj, requireSkyraInVoiceChannel } from '@utils/Music/Decorators';
import { KlasaMessage } from 'klasa';

@ApplyOptions<MusicCommandOptions>({
	description: (language) => language.get('commandLeaveDescription'),
	extendedHelp: (language) => language.get('commandLeaveExtended'),
	flagSupport: true
})
export default class extends MusicCommand {
	@requireSkyraInVoiceChannel()
	@requireDj()
	public async run(message: KlasaMessage) {
		// Do a full leave and disconnect
		await message.guild!.music.leave(this.getContext(message));

		// If --removeall or --ra was provided then also clear the queue
		if (Reflect.has(message.flagArgs, 'removeall') || Reflect.has(message.flagArgs, 'ra')) {
			message.guild!.music.queue = [];
		}
	}
}
