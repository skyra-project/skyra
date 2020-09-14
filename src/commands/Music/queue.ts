import { DbSet } from '@lib/structures/DbSet';
import { Song } from '@lib/structures/music/Song';
import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { chunk } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors, ZeroWidhSpace } from '@utils/constants';
import { pickRandom, showSeconds } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<MusicCommandOptions>({
	aliases: ['q', 'playing-time', 'pt'],
	description: (language) => language.get('commandQueueDescription'),
	requiredPermissions: ['ADD_REACTIONS', 'MANAGE_MESSAGES', 'EMBED_LINKS', 'READ_MESSAGE_HISTORY']
})
export default class extends MusicCommand {
	public async run(message: KlasaMessage) {
		const { queue, song } = message.guild!.music;

		if (song === null && queue.length === 0) throw message.language.get('commandQueueEmpty');

		// Send the loading message
		const response = await message.send(
			new MessageEmbed().setColor(BrandingColors.Secondary).setDescription(pickRandom(message.language.get('systemLoading')))
		);

		// Generate the pages with 5 songs each
		const queueDisplay = new UserRichDisplay(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setTitle(message.language.get('commandQueueTitle', { guildname: message.guild!.name }))
		);

		if (song) {
			const nowPlayingDescription = [
				song.stream ? message.language.get('commandQueueNowplayingLiveStream') : song.friendlyDuration,
				message.language.get('commandQueueNowplaying', {
					title: song.safeTitle,
					url: song.url,
					requester: await song.fetchRequesterName()
				})
			];

			if (!song.stream)
				nowPlayingDescription.push(
					message.language.get('commandQueueNowplayingTimeRemaining', { timeRemaining: showSeconds(message.guild!.music.trackRemaining) })
				);

			queueDisplay.embedTemplate.addField(message.language.get('commandQueueNowplayingTitle'), nowPlayingDescription.join(' | '));
		}

		if (queue && queue.length) {
			// Format the song entries
			const songFields = await Promise.all(queue.map((song, position) => this.generateSongField(message, position, song)));
			const totalDuration = this.calculateTotalDuration(queue);
			const totalDescription = message.language.get('commandQueueTotal', {
				songs: message.language.get(queue.length === 1 ? 'commandAddPlaylistSongs' : 'commandAddPlaylistSongsPlural', {
					count: queue.length
				}),
				remainingTime: showSeconds(totalDuration)
			});

			queueDisplay.embedTemplate.addField(message.language.get('commandQueueTotalTitle'), totalDescription);
			queueDisplay.embedTemplate.addField(ZeroWidhSpace, message.language.get('commandQueueDashboardInfo', { guild: message.guild! }));

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
		return message.language.get('commandQueueLine', {
			position: position + 1,
			duration: song.friendlyDuration,
			title: song.safeTitle,
			url: song.url,
			requester: username
		});
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
