import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { MusicCommand } from '../../lib/structures/MusicCommand';
import { showSeconds } from '../../lib/util/util';

export default class extends MusicCommand {

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: (language) => language.get('COMMAND_TIME_DESCRIPTION'),
			music: ['QUEUE_NOT_EMPTY', 'VOICE_PLAYING']
		});
	}

	public async run(message: KlasaMessage) {
		const { music } = message.guild;
		if (!music.playing) throw `Are you speaking to me? Because my deck is empty...`;
		return (music[0].stream
			? message.sendLocale('COMMAND_TIME_STREAM')
			: message.sendLocale('COMMAND_TIME_REMAINING', [showSeconds(music.trackRemaining)]));
	}

}
