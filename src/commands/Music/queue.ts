import { DbSet } from '@lib/structures/DbSet';
import { Song } from '@lib/structures/music/Song';
import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { chunk } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors, ZeroWidhSpace } from '@utils/constants';
import { pickRandom, showSeconds } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<MusicCommandOptions>({
	aliases: ['q', 'playing-time', 'pt'],
	description: (language) => language.get(LanguageKeys.Commands.Music.QueueDescription),
	requiredPermissions: ['ADD_REACTIONS', 'MANAGE_MESSAGES', 'EMBED_LINKS', 'READ_MESSAGE_HISTORY']
})
export default class extends MusicCommand {
	public async run(message: KlasaMessage) {
		const { queue, song } = message.guild!.music;

		if (song === null && queue.length === 0) throw message.language.get(LanguageKeys.Commands.Music.QueueEmpty);

		// Send the loading message
		const response = await message.send(
			new MessageEmbed().setColor(BrandingColors.Secondary).setDescription(pickRandom(message.language.get(LanguageKeys.System.Loading)))
		);

		// Generate the pages with 5 songs each
		const queueDisplay = new UserRichDisplay(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setTitle(message.language.get(LanguageKeys.Commands.Music.QueueTitle, { guildname: message.guild!.name }))
		);

		if (song) {
			const nowPlayingDescription = [
				song.stream ? message.language.get(LanguageKeys.Commands.Music.QueueNowplayingLiveStream) : song.friendlyDuration,
				message.language.get(LanguageKeys.Commands.Music.QueueNowplaying, {
					title: song.safeTitle,
					url: song.url,
					requester: await song.fetchRequesterName()
				})
			];

			if (!song.stream)
				nowPlayingDescription.push(
					message.language.get(LanguageKeys.Commands.Music.QueueNowplayingTimeRemaining, {
						timeRemaining: showSeconds(message.guild!.music.trackRemaining)
					})
				);

			queueDisplay.embedTemplate.addField(
				message.language.get(LanguageKeys.Commands.Music.QueueNowplayingTitle),
				nowPlayingDescription.join(' | ')
			);
		}

		if (queue && queue.length) {
			// Format the song entries
			const songFields = await Promise.all(queue.map((song, position) => this.generateSongField(message, position, song)));
			const totalDuration = this.calculateTotalDuration(queue);
			const totalDescription = message.language.get(LanguageKeys.Commands.Music.QueueTotal, {
				songs: message.language.get(
					queue.length === 1 ? LanguageKeys.Commands.Music.AddPlaylistSongs : LanguageKeys.Commands.Music.AddPlaylistSongsPlural,
					{
						count: queue.length
					}
				),
				remainingTime: showSeconds(totalDuration)
			});

			queueDisplay.embedTemplate.addField(message.language.get(LanguageKeys.Commands.Music.QueueTotalTitle), totalDescription);
			queueDisplay.embedTemplate.addField(
				ZeroWidhSpace,
				message.language.get(LanguageKeys.Commands.Music.QueueDashboardInfo, { guild: message.guild! })
			);

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
		return message.language.get(LanguageKeys.Commands.Music.QueueLine, {
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
