import { CommandStore, KlasaMessage } from 'klasa';
import { MusicCommand } from '../../lib/structures/MusicCommand';

export default class extends MusicCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['q'],
			description: language => language.get('COMMAND_QUEUE_DESCRIPTION'),
			music: ['QUEUE_NOT_EMPTY']
		});
	}

	public async run(message: KlasaMessage) {
		const queue = message.guild!.music;
		if (!queue.length) throw message.language.get(queue.song ? 'COMMAND_QUEUE_LAST' : 'COMMAND_QUEUE_EMPTY');

		const output: string[] = [];
		for (let i = 0; i < Math.min(queue.length, 10); i++) {
			const song = queue[i];
			output[i] = [
				`[__\`${String(i + 1).padStart(2, '0')}\`__] ${message.language.get('COMMAND_QUEUE_LINE', song.title.replace(/\*/g, '\\*'), (await song.fetchRequester())!.tag)}`,
				`   └── <${song.url}> (${song.friendlyDuration})`
			].join('\n');
		}
		if (queue.length > 10) output.push('', message.language.get('COMMAND_QUEUE_TRUNCATED', queue.length));

		return message.sendMessage(output.join('\n'));
	}

}
