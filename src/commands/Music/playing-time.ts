import { CommandStore, KlasaMessage } from 'klasa';
import { MusicCommand } from '../../lib/structures/MusicCommand';
import { showSeconds } from '../../lib/util/util';

export default class extends MusicCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['pt'],
			description: language => language.get('COMMAND_TIME_DESCRIPTION'),
			music: ['QUEUE_NOT_EMPTY', 'VOICE_PLAYING']
		});
	}

	public async run(message: KlasaMessage) {
		const { music } = message.guild!;
		if (!music.song) throw `Uhm... I think I missed something... oh yeah, I'm not playing anything.`;
		return (music.song.stream
			? message.sendLocale('COMMAND_TIME_STREAM')
			: message.sendLocale('COMMAND_TIME_REMAINING', [showSeconds(music.trackRemaining)]));
	}

}
