import { Queue } from '#lib/audio';
import { DbSet } from '#lib/database';
import { MusicCommand } from '#lib/structures/MusicCommand';
import { UserRichDisplay } from '#lib/structures/UserRichDisplay';
import { GuildMessage } from '#lib/types/Discord';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { BrandingColors, ZeroWidthSpace } from '#utils/constants';
import { requireQueueNotEmpty } from '#utils/Music/Decorators';
import { pickRandom, showSeconds } from '#utils/util';
import { chunk } from '@sapphire/utilities';
import { TrackInfo } from '@skyra/audio';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<MusicCommand.Options>({
	aliases: ['q', 'playing-time', 'pt'],
	description: LanguageKeys.Commands.Music.QueueDescription,
	extendedHelp: LanguageKeys.Commands.Music.QueueExtended,
	requiredPermissions: ['ADD_REACTIONS', 'MANAGE_MESSAGES', 'EMBED_LINKS', 'READ_MESSAGE_HISTORY']
})
export default class extends MusicCommand {
	@requireQueueNotEmpty()
	public async run(message: GuildMessage) {
		const t = await message.fetchT();

		// Send the loading message
		const response = await message.send(
			new MessageEmbed().setColor(BrandingColors.Secondary).setDescription(pickRandom(t(LanguageKeys.System.Loading, { returnObjects: true })))
		);

		// Generate the pages with 5 songs each
		const queueDisplay = new UserRichDisplay(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setTitle(t(LanguageKeys.Commands.Music.QueueTitle, { guildname: message.guild.name }))
		);

		const { audio } = message.guild;
		const current = await audio.nowPlaying();
		const tracks = await this.getTrackInformation(audio);

		if (current) {
			const track = current.entry.info;
			const nowPlayingDescription = [
				track.isStream ? t(LanguageKeys.Commands.Music.QueueNowPlayingLiveStream) : showSeconds(track.length),
				t(LanguageKeys.Commands.Music.QueueNowPlaying, {
					title: track.title,
					url: track.uri,
					requester: await this.fetchRequesterName(message, t, current.entry.author)
				})
			];

			if (!track.isStream) {
				nowPlayingDescription.push(
					t(LanguageKeys.Commands.Music.QueueNowPlayingTimeRemaining, {
						timeRemaining: showSeconds(track.length - current.position)
					})
				);
			}

			queueDisplay.embedTemplate.addField(t(LanguageKeys.Commands.Music.QueueNowPlayingTitle), nowPlayingDescription.join(' | '));
		}

		if (tracks.length) {
			// Format the song entries
			const songFields = await Promise.all(tracks.map((track, position) => this.generateTrackField(message, t, position, track)));
			const totalDuration = this.calculateTotalDuration(tracks);
			const totalDescription = t(LanguageKeys.Commands.Music.QueueTotal, {
				songs: t(LanguageKeys.Commands.Music.AddPlaylistSongs, {
					count: tracks.length
				}),
				remainingTime: showSeconds(totalDuration)
			});

			queueDisplay.embedTemplate.addField(t(LanguageKeys.Commands.Music.QueueTotalTitle), totalDescription);
			queueDisplay.embedTemplate.addField(ZeroWidthSpace, t(LanguageKeys.Commands.Music.QueueDashboardInfo, { guild: message.guild }));

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

	private async generateTrackField(message: GuildMessage, t: TFunction, position: number, entry: DecodedQueueEntry) {
		const username = await this.fetchRequesterName(message, t, entry.author);
		return t(LanguageKeys.Commands.Music.QueueLine, {
			position: position + 1,
			duration: showSeconds(entry.data.length),
			title: entry.data.title,
			url: entry.data.uri,
			requester: username
		});
	}

	private calculateTotalDuration(entries: readonly DecodedQueueEntry[]) {
		let accumulator = 0;
		for (const entry of entries) {
			if (entry.data.isStream) return -1;
			accumulator += entry.data.length;
		}

		return accumulator;
	}

	private async fetchRequesterName(message: GuildMessage, t: TFunction, userID: string): Promise<string> {
		try {
			return (await message.guild.members.fetch(userID)).displayName;
		} catch {}

		try {
			return (await this.client.users.fetch(userID)).username;
		} catch {}

		return t(LanguageKeys.Misc.UnknownUser);
	}

	private async getTrackInformation(audio: Queue): Promise<readonly DecodedQueueEntry[]> {
		const tracks = await audio.tracks();
		const decodedTracks = await audio.player.node.decode(tracks.map((track) => track.track));

		const map = new Map<string, TrackInfo>();
		for (const entry of decodedTracks) {
			map.set(entry.track, entry.info);
		}

		return tracks.map((track) => ({ author: track.author, data: map.get(track.track)! }));
	}
}

interface DecodedQueueEntry {
	author: string;
	data: TrackInfo;
}
