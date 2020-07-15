import { chunk } from '@klasa/utils';
import { DbSet } from '@lib/structures/DbSet';
import { Song } from '@lib/structures/music/Song';
import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';
import { showSeconds } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<MusicCommandOptions>({
	aliases: ['q', 'playing-time', 'pt'],
	description: language => language.tget('COMMAND_QUEUE_DESCRIPTION'),
	requiredPermissions: ['ADD_REACTIONS', 'MANAGE_MESSAGES', 'EMBED_LINKS', 'READ_MESSAGE_HISTORY']
})
export default class extends MusicCommand {

	public async run(message: KlasaMessage) {
		const { queue, song } = message.guild!.music;

		if (song === null && queue.length === 0) throw message.language.tget('COMMAND_QUEUE_EMPTY');

		// Send the loading message
		const response = await message.send(new MessageEmbed()
			.setColor(BrandingColors.Secondary)
			.setDescription(message.language.tget('SYSTEM_LOADING')));

		// Generate the pages with 5 songs each
		const queueDisplay = new UserRichDisplay(new MessageEmbed()
			.setColor(await DbSet.fetchColor(message))
			.setTitle(message.language.tget('COMMAND_QUEUE_TITLE', message.guild!.name)));

		if (song) {
			const nowPlayingDescription = message.language.tget(
				'COMMAND_QUEUE_NOWPLAYING',
				{
					duration: song.stream ? null : song.friendlyDuration,
					title: song.safeTitle,
					url: song.url,
					requester: await song.fetchRequesterName(),
					timeRemaining: song.stream ? null : showSeconds(message.guild!.music.trackRemaining)
				}
			);

			queueDisplay.embedTemplate.addField(message.language.tget('COMMAND_QUEUE_NOWPLAYING_TITLE'), nowPlayingDescription);
		}

		if (queue && queue.length) {
			// Format the song entries
			const songFields = await Promise.all(queue.map((song, position) => this.generateSongField(message, position, song)));
			const totalDuration = this.calculateTotalDuration(queue);
			const totalDescription = message.language.tget('COMMAND_QUEUE_TOTAL', queue.length, showSeconds(totalDuration));

			queueDisplay.embedTemplate.addField(message.language.tget('COMMAND_QUEUE_TOTAL_TITLE'), totalDescription);
			queueDisplay.embedTemplate.addField('\u200b', message.language.tget('COMMAND_QUEUE_DASHBOARD_INFO', message.guild!));

			for (const page of chunk(songFields, 5)) {
				queueDisplay.addPage((embed: MessageEmbed) => embed.setDescription(page.join('\n\n')));
			}
		}

		if (queueDisplay.pages.length) {
			// Run the display
			await queueDisplay.start(response, message.author.id);
			return response;
		}

		// Just send the template as a regular embed as there are no pages to display
		return response.edit(undefined, queueDisplay.template);
	}

	private async generateSongField(message: KlasaMessage, position: number, song: Song) {
		const username = await song.fetchRequesterName();
		return message.language.tget('COMMAND_QUEUE_LINE', position + 1, song.friendlyDuration, song.safeTitle, song.url, username);
	}

	private calculateTotalDuration(songs: Song[]) {
		let accumulator = 0;
		for (const song of songs) {
			if (song.stream) return -1;
			accumulator += song.duration;
		}

		return accumulator;
	}

}
