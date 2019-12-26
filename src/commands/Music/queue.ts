import { CommandStore, KlasaMessage, RichDisplay } from 'klasa';
import { MusicCommand } from '../../lib/structures/MusicCommand';
import { Util, MessageEmbed } from 'discord.js';
import { getColor } from '../../lib/util/util';
import { Time } from '../../lib/util/constants';

export default class extends MusicCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['q'],
			description: language => language.tget('COMMAND_QUEUE_DESCRIPTION'),
			music: ['QUEUE_NOT_EMPTY']
		});
	}

	public async run(message: KlasaMessage) {
		const { queue } = message.guild!.music;
		if (!queue.length) throw message.language.tget(message.guild!.music.song ? 'COMMAND_QUEUE_LAST' : 'COMMAND_QUEUE_EMPTY');

		// Send the loading message
		const response = await message.send(new MessageEmbed()
			.setColor(getColor(message))
			.setDescription(message.language.tget('SYSTEM_LOADING')));

		// Format the song entries
		const songFields = await Promise.all(queue.map(async (song, position) => [`[${position + 1}] ${Util.escapeMarkdown(song.title)} | ${song.friendlyDuration}`, `As requested by **${Util.escapeMarkdown((await song.fetchRequester())!.tag)}**. [Audio Source](${song.url})`]));

		// Generate the pages with 10 songs each
		const pages = this.chunkify(songFields, 10);
		const queueDisplay = new RichDisplay(new MessageEmbed()
			.setColor(getColor(message))
			.setTitle(`Music queue for ${message.guild!.name}`)
			.setDescription(`Total tracks left: ${queue.length}\n`));

		for (const page of pages) {
			queueDisplay.addPage((template: MessageEmbed) => {
				for (const [title, value] of page) {
					template.addField(title, value);
				}
				return template;
			});
		}

		// Run the display
		return queueDisplay.run(response, { time: 3 * Time.Minute, filter: (_reaction, user) => user.id === message.author.id });
	}

	/**
	 * Splits an array into smaller pieces
	 * @param array The array to convert into chunks
	 * @param amount How many elements each chunk has
	 */
	private chunkify(array: string[][], amount: number) {
		if (array.length <= amount) return [array];
		const chunks = [];
		while (array.length > amount) {
			chunks.push(array.splice(0, amount));
		}
		return chunks;
	}

}
