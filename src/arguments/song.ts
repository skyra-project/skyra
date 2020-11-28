import { GuildSettings } from '#lib/database';
import { count, filter, map, take } from '#lib/misc';
import { GuildMessage } from '#lib/types';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { fetch, FetchResultTypes } from '#utils/util';
import { parseURL } from '@sapphire/utilities';
import { LoadType, Track } from '@skyra/audio';
import { deserialize } from 'binarytf';
import { Argument, Possible } from 'klasa';

export default class extends Argument {
	public async run(arg: string, _: Possible, message: GuildMessage): Promise<string[]> {
		const remaining = await this.getUserRemainingEntries(message);
		if (remaining === 0) throw await message.fetchLocale(LanguageKeys.MusicManager.TooManySongs);

		const tracks = arg
			? (await this.handleURL(message, remaining, arg)) ??
			  (await this.handleSoundCloud(message, remaining, arg)) ??
			  (await this.handleYouTube(message, remaining, arg))
			: // Handle arg-less (attachment).
			  await this.handleAttachments(message, remaining);

		if (tracks === null || tracks.length === 0) {
			throw await message.fetchLocale(LanguageKeys.MusicManager.FetchNoMatches);
		}

		return tracks;
	}

	/**
	 * Retrieves how many new tracks the user can queue.
	 * @param message The message that ran the argument.
	 */
	private async getUserRemainingEntries(message: GuildMessage): Promise<number> {
		const tracks = await message.guild.audio.tracks();
		const { id } = message.author;
		const entries = count(tracks.values(), (track) => track.author === id);
		const maximum = await message.guild.readSettings(GuildSettings.Music.MaximumEntriesPerUser);
		return Math.max(0, maximum - entries);
	}

	/**
	 * Handle attachment arguments (arg-less).
	 * @param message The message that ran the argument.
	 * @param remaining The amount of entries the user can add.
	 */
	private async handleAttachments(message: GuildMessage, remaining: number) {
		if (message.attachments.size === 0) {
			throw await message.fetchLocale(LanguageKeys.MusicManager.FetchNoArguments);
		}

		const { url } = message.attachments.first()!;
		const binary = await this.downloadAttachment(message, url);
		const data = await this.parseAttachment(message, binary);
		return this.filter(message, remaining, data);
	}

	/**
	 * Parses and decodes the response from a buffer.
	 * @param message The message that ran the argument.
	 * @param binary The binary data to parse.
	 */
	private async parseAttachment(message: GuildMessage, binary: Uint8Array): Promise<Track[]> {
		try {
			const tracks = deserialize<string[]>(binary);
			return await message.guild.audio.player.node.decode(tracks);
		} catch {
			throw await message.fetchLocale(LanguageKeys.MusicManager.ImportQueueError);
		}
	}

	/**
	 * Downloads an attachment by its URL.
	 * @param message The message that ran the argument.
	 * @param url The URL of the file to download.
	 */
	private async downloadAttachment(message: GuildMessage, url: string): Promise<Uint8Array> {
		try {
			return await fetch(url, FetchResultTypes.Buffer);
		} catch {
			throw await message.fetchLocale(LanguageKeys.MusicManager.ImportQueueNotFound);
		}
	}

	/**
	 * Parses a possible URL argument.
	 * @param message The message that ran the argument.
	 * @param remaining The amount of entries the user can add.
	 * @param arg The argument to parse.
	 * @returns
	 * - `null` when the argument is not a valid URL.
	 * - `string[]` otherwise.
	 */
	private async handleURL(message: GuildMessage, remaining: number, arg: string): Promise<string[] | null> {
		// Remove `<...>` escape characters.
		const url = parseURL(arg.replace(/^<(.+)>$/g, '$1'));
		if (url === null) return null;

		// If the argument was run with an `--import` flag, download the data as a squeue.
		if (Reflect.has(message.flagArgs, 'import')) {
			const binary = await this.downloadAttachment(message, url);
			const data = await this.parseAttachment(message, binary);
			return this.filter(message, remaining, data);
		}

		// Download the results from the URL. e.g.
		// - https://www.youtube.com/watch?v=J9Q3i5w6-Ug
		// - https://soundcloud.com/user-417823582/twrp-starlight-brigade-feat-1
		// - https://www.twitch.tv/monstercat
		return this.downloadResults(message, remaining, url);
	}

	/**
	 * Parses a possible track or playlist of tracks from SoundCloud.
	 * @param message The message that ran the argument.
	 * @param remaining The amount of entries the user can add.
	 * @param arg The argument to parse.
	 * @returns
	 * - `null` if neither `--sc` nor `--soundcloud` flags were provided.
	 * - `string[]` otherwise.
	 */
	private handleSoundCloud(message: GuildMessage, remaining: number, arg: string): Promise<string[] | null> {
		if (Reflect.has(message.flagArgs, 'sc') || Reflect.has(message.flagArgs, 'soundcloud')) {
			return this.downloadResults(message, remaining, `scsearch: ${arg}`);
		}

		return Promise.resolve(null);
	}

	/**
	 * Parses a possible track or playlist of tracks from YouTube.
	 * @param message The message that ran the argument.
	 * @param remaining The amount of entries the user can add.
	 * @param arg The argument to parse.
	 * @returns Always `string[]`.
	 */
	private handleYouTube(message: GuildMessage, remaining: number, arg: string): Promise<string[] | null> {
		return this.downloadResults(message, remaining, `ytsearch: ${arg}`);
	}

	/**
	 * Downloads the tracks from the audio server, then filters them.
	 * @param message The message that ran the argument.
	 * @param remainingUserEntries The amount of entries the user can add.
	 * @param search The search argument.
	 * @returns Always `string[]`.
	 */
	private async downloadResults(message: GuildMessage, remainingUserEntries: number, search: string): Promise<string[]> {
		try {
			// Load the data from the node:
			const response = await message.guild.audio.player.node.load(search);

			// No matches: throw.
			if (response.loadType === LoadType.NoMatches) throw await message.fetchLocale(LanguageKeys.MusicManager.FetchNoMatches);

			// Load failed: throw.
			if (response.loadType === LoadType.LoadFailed) throw await message.fetchLocale(LanguageKeys.MusicManager.FetchLoadFailed);

			// Loaded playlist: filter all tracks.
			if (response.loadType === LoadType.PlaylistLoaded) return this.filter(message, remainingUserEntries, response.tracks);

			// Loaded track, retrieve the first one that can be loaded.
			const tracks = await this.filter(message, remainingUserEntries, response.tracks);

			// If there was no available track, return empty array.
			if (tracks.length === 0) return tracks;

			// Else return an array with only the first track.
			return [tracks[0]];
		} catch {
			return [];
		}
	}

	/**
	 * Filters the tracks by whether the server allows streams, their duration, and trims the entries by `remaining`.
	 * @param message The message that ran the argument.
	 * @param remaining The amount of entries the user can add.
	 * @param tracks The downloaded tracks to filter.
	 */
	private async filter(message: GuildMessage, remaining: number, tracks: Track[]): Promise<string[]> {
		if (await message.member.isDJ()) return [...map(take(tracks.values(), remaining), (track) => track.track)];

		const [maximumDuration, allowStreams] = await message.guild.readSettings([
			GuildSettings.Music.MaximumDuration,
			GuildSettings.Music.AllowStreams
		]);
		const filteredStreams = allowStreams ? tracks.values() : filter(tracks.values(), (track) => !track.info.isStream);
		const filteredDuration = filter(filteredStreams, (track) => track.info.length <= maximumDuration);
		const mappedTracks = map(filteredDuration, (track) => track.track);
		return [...take(mappedTracks, remaining)];
	}
}
