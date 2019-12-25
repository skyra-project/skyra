import { CommandStore, KlasaMessage } from 'klasa';
import { MusicCommand } from '../../lib/structures/MusicCommand';
import { Util } from 'discord.js';

export default class extends MusicCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['q'],
			description: language => language.tget('COMMAND_QUEUE_DESCRIPTION'),
			music: ['QUEUE_NOT_EMPTY']
		});
	}

	public async run(message: KlasaMessage) {
		const manager = message.guild!.music;
		if (!manager.queue.length) throw message.language.tget(manager.song ? 'COMMAND_QUEUE_LAST' : 'COMMAND_QUEUE_EMPTY');

		const output: string[] = [];
		for (let i = 0; i < Math.min(manager.queue.length, 10); i++) {
			const song = manager.queue[i];
			output[i] = [
				`[__\`${String(i + 1).padStart(2, '0')}\`__] ${message.language.tget(
					'COMMAND_QUEUE_LINE', song.safeTitle, Util.escapeMarkdown((await song.fetchRequester())!.tag)
				)}`,
				`   └── <${song.url}> (${song.friendlyDuration})`
			].join('\n');
		}
		if (manager.queue.length > 10) output.push('', message.language.tget('COMMAND_QUEUE_TRUNCATED', manager.queue.length));

		return message.sendMessage(output.join('\n'));
	}

}
