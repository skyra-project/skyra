import { chunk } from '@klasa/utils';
import { MusicCommand } from '@lib/structures/MusicCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { getColor, showSeconds } from '@utils/util';
import { MessageEmbed, Util } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends MusicCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['q'],
			description: language => language.tget('COMMAND_QUEUE_DESCRIPTION'),
			music: ['QUEUE_NOT_EMPTY']
		});
	}

	public async run(message: KlasaMessage) {
		const { queue, song } = message.guild!.music;
		if (!queue.length || !song) throw message.language.tget(song ? 'COMMAND_QUEUE_LAST' : 'COMMAND_QUEUE_EMPTY');

		// Send the loading message
		const response = await message.send(new MessageEmbed()
			.setColor(getColor(message))
			.setDescription(message.language.tget('SYSTEM_LOADING')));

		// Format the song entries
		const songFields = await Promise.all(queue.map(async (song, pos) => message.language.tget('COMMAND_QUEUE_LINE', pos, Util.escapeMarkdown(song.title), song.url, song.friendlyDuration, Util.escapeMarkdown((await song.fetchRequester())!.username))));

		// Generate the pages with 10 songs each
		const pages = chunk(songFields, 5);
		const queueDisplay = new UserRichDisplay(new MessageEmbed()
			.setColor(getColor(message))
			.setTitle(message.language.tget('COMMAND_QUEUE_TITLE', message.guild!.name))
			.addField(message.language.tget('COMMAND_QUEUE_NOWPLAYING_TITLE'), message.language.tget('COMMAND_QUEUE_NOWPLAYING', Util.escapeMarkdown(song.title), song.url, song.friendlyDuration, Util.escapeMarkdown((await song.fetchRequester())!.username)))
			.addField(message.language.tget('COMMAND_QUEUE_TOTAL_TITLE'), message.language.tget('COMMAND_QUEUE_TOTAL', queue.length, showSeconds(queue.map(song => song.duration).reduce((a, b) => a + b)))));

		for (const page of pages) {
			queueDisplay.addPage((embed: MessageEmbed) => embed.setDescription(page.join('\n\n')));
		}

		// Run the display
		await queueDisplay.start(response, message.author.id);
		return response;
	}

}
