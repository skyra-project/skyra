import { AudioCommand, Queue, RequireQueueNotEmpty } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types/Discord';
import { ZeroWidthSpace } from '#utils/constants';
import { getAudio } from '#utils/functions';
import { sendLoadingMessage, showSeconds } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { chunk } from '@sapphire/utilities';
import type { TrackInfo } from '@skyra/audio';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import { MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<AudioCommand.Options>({
	aliases: ['q', 'playing-time', 'pt'],
	description: LanguageKeys.Commands.Music.QueueDescription,
	detailedDescription: LanguageKeys.Commands.Music.QueueExtended,
	requiredClientPermissions: [
		PermissionFlagsBits.AddReactions,
		PermissionFlagsBits.ManageMessages,
		PermissionFlagsBits.EmbedLinks,
		PermissionFlagsBits.ReadMessageHistory
	]
})
export class UserAudioCommand extends AudioCommand {
	@RequireQueueNotEmpty()
	public async messageRun(message: GuildMessage, args: AudioCommand.Args) {
		const response = await sendLoadingMessage(message, args.t);

		// Generate the pages with 5 songs each
		const template = new MessageEmbed()
			.setColor(await this.container.db.fetchColor(message))
			.setTitle(args.t(LanguageKeys.Commands.Music.QueueTitle, { guildname: message.guild.name }));
		const queueDisplay = new SkyraPaginatedMessage({ template });

		const audio = getAudio(message.guild);
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
			await queueDisplay.run(response, message.author);
			return response;
		}

		// Just send the template as a regular embed as there are no pages to display
		return response.edit(queueDisplay.template);
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

	private async fetchRequesterName(message: GuildMessage, t: TFunction, userId: string): Promise<string> {
		try {
			return (await message.guild.members.fetch(userId)).displayName;
		} catch {}

		try {
			return (await this.container.client.users.fetch(userId)).username;
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
