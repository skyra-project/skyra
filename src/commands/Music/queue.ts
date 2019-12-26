import { CommandStore, KlasaMessage } from 'klasa';
import { MusicCommand } from '../../lib/structures/MusicCommand';
import { Util, MessageEmbed } from 'discord.js';
import { getColor, showSeconds } from '../../lib/util/util';
import { isNumber } from '@klasa/utils';
import { Song } from '../../lib/structures/music/Song';
import { UserRichDisplay } from '../../lib/structures/UserRichDisplay';

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
		const songFields = await Promise.all(queue.map((song, pos) => this.formatSong(song, pos + 1)));

		// Generate the pages with 10 songs each
		const pages = this.chunkify(songFields, 5);
		const queueDisplay = new UserRichDisplay(new MessageEmbed()
			.setColor(getColor(message))
			.setTitle(`Music queue for ${message.guild!.name}`)
			.addField('Now Playing:', await this.formatSong(message.guild!.music.song!))
			.addField('Total songs:', `${queue.length} songs remaining. (${showSeconds(queue.map(song => song.duration).reduce((a, b) => a + b))} remaining)`));

		for (const page of pages) {
			queueDisplay.addPage((template: MessageEmbed) => template.setDescription(page.join('\n\n')));
		}

		// Run the display
		await queueDisplay.start(response, message.author.id);
		return response;
	}

	/**
	 * Splits an array into smaller pieces
	 * @param array The array to convert into chunks
	 * @param amount How many elements each chunk has
	 */
	private chunkify(array: string[], amount: number) {
		if (array.length <= amount) return [array];
		const chunks = [];
		while (array.length > amount) {
			chunks.push(array.splice(0, amount));
		}
		return chunks;
	}

	private async formatSong(song: Song, position?: number) {
		return `${isNumber(position) ? `[${position}]` : ''} [${Util.escapeMarkdown(song.title)}](${song.url}) | (${song.friendlyDuration}) | Requested by **${Util.escapeMarkdown((await song.fetchRequester())!.username)}**.`;
	}

}
