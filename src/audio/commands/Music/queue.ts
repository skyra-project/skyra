import { MusicCommand, Queue, requireQueueNotEmpty } from '#lib/audio';
import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { UserPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types/Discord';
import { ZeroWidthSpace } from '#utils/constants';
import { sendLoadingMessage, showSeconds } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { chunk } from '@sapphire/utilities';
import type { TrackInfo } from '@skyra/audio';
import { MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<MusicCommand.Options>({
	aliases: ['q', 'playing-time', 'pt'],
	description: LanguageKeys.Commands.Music.QueueDescription,
	extendedHelp: LanguageKeys.Commands.Music.QueueExtended,
	permissions: ['ADD_REACTIONS', 'MANAGE_MESSAGES', 'EMBED_LINKS', 'READ_MESSAGE_HISTORY']
})
export class UserMusicCommand extends MusicCommand {
	@requireQueueNotEmpty()
	public async run(message: GuildMessage, args: MusicCommand.Args) {
		const response = await sendLoadingMessage(message, args.t);

		// Generate the pages with 5 songs each
		const template = new MessageEmbed()
			.setColor(await this.context.db.fetchColor(message))
			.setTitle(args.t(LanguageKeys.Commands.Music.QueueTitle, { guildname: message.guild.name }));
		const queueDisplay = new UserPaginatedMessage({ template });

		const { audio } = message.guild;
		const current = await audio.nowPlaying();
		const tracks = await this.getTrackInformation(audio);

		if (current) {
			const track = current.entry.info;
			const nowPlayingDescription = [
				track.isStream ? args.t(LanguageKeys.Commands.Music.QueueNowPlayingLiveStream) : showSeconds(track.length),
				args.t(LanguageKeys.Commands.Music.QueueNowPlaying, {
					title: track.title,
					url: track.uri,
					requester: await this.fetchRequesterName(message, args.t, current.entry.author)
				})
			];

			if (!track.isStream) {
				nowPlayingDescription.push(
					args.t(LanguageKeys.Commands.Music.QueueNowPlayingTimeRemaining, {
						timeRemaining: showSeconds(track.length - current.position)
					})
				);
			}

			template.addField(args.t(LanguageKeys.Commands.Music.QueueNowPlayingTitle), nowPlayingDescription.join(' | '));
		}

		if (tracks.length) {
			// Format the song entries
			const songFields = await Promise.all(tracks.map((track, position) => this.generateTrackField(message, args.t, position, track)));
			const totalDuration = this.calculateTotalDuration(tracks);
			const totalDescription = args.t(LanguageKeys.Commands.Music.QueueTotal, {
				songs: args.t(LanguageKeys.Commands.Music.AddPlaylistSongs, { count: tracks.length }),
				remainingTime: showSeconds(totalDuration)
			});

			template.addField(args.t(LanguageKeys.Commands.Music.QueueTotalTitle), totalDescription);
			template.addField(ZeroWidthSpace, args.t(LanguageKeys.Commands.Music.QueueDashboardInfo, { guild: message.guild }));

			for (const page of chunk(songFields, 5)) {
				queueDisplay.addPageEmbed((embed) => embed.setDescription(page.join('\n\n')));
			}
		}

		if (queueDisplay.pages.length) {
			// Run the display
			await queueDisplay.start(response as GuildMessage, message.author);
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
			return (await this.context.client.users.fetch(userID)).username;
		} catch {}

		return t(LanguageKeys.Serializers.UnknownUser);
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
