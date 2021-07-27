import { GuildSettings, readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types';
import { count, filter, map, take } from '#utils/common';
import { isDJ } from '#utils/functions';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { Args, Argument, ArgumentContext } from '@sapphire/framework';
import { parseURL } from '@sapphire/utilities';
import { LoadType, Track } from '@skyra/audio';
import { deserialize } from 'binarytf';

export class UserArgument extends Argument<string[]> {
	public async run(parameter: string, context: ArgumentContext) {
		const message = context.message as GuildMessage;
		const remaining = await this.getUserRemainingEntries(message);
		if (remaining === 0) return this.error({ parameter, identifier: LanguageKeys.MusicManager.TooManySongs, context });

		const tracks =
			(await this.handleURL(message, remaining, parameter, context.args)) ??
			(await this.handleSoundCloud(message, remaining, parameter, context.args)) ??
			(await this.handleYouTube(message, remaining, parameter));

		if (tracks === null || tracks.length === 0) {
			return this.error({ parameter, identifier: LanguageKeys.MusicManager.FetchNoMatches, context });
		}

		return this.ok(tracks);
	}

	/**
	 * Retrieves how many new tracks the user can queue.
	 * @param message The message that ran the argument.
	 */
	private async getUserRemainingEntries(message: GuildMessage): Promise<number> {
		const tracks = await message.guild.audio.tracks();
		const { id } = message.author;
		const entries = count(tracks.values(), (track) => track.author === id);
		const maximum = await readSettings(message.guild, GuildSettings.Music.MaximumEntriesPerUser);
		return Math.max(0, maximum - entries);
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
			throw await message.resolveKey(LanguageKeys.MusicManager.ImportQueueError);
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
			throw await message.resolveKey(LanguageKeys.MusicManager.ImportQueueNotFound);
		}
	}

	/**
	 * Parses a possible URL argument.
	 * @param message The message that ran the argument.
	 * @param remaining The amount of entries the user can add.
	 * @param argument The argument to parse.
	 * @returns
	 * - `null` when the argument is not a valid URL.
	 * - `string[]` otherwise.
	 */
	private async handleURL(message: GuildMessage, remaining: number, argument: string, args: Args): Promise<string[] | null> {
		// Remove `<...>` escape characters.
		const url = parseURL(argument.replace(/^<(.+)>$/g, '$1'));
		if (url === null) return null;

		// If the argument was run with an `--import` flag, download the data as a squeue.
		if (args.getFlags('import')) {
			const binary = await this.downloadAttachment(message, url.href);
			const data = await this.parseAttachment(message, binary);
			return this.filter(message, remaining, data);
		}

		// Download the results from the URL. e.g.
		// - https://www.youtube.com/watch?v=J9Q3i5w6-Ug
		// - https://soundcloud.com/user-417823582/twrp-starlight-brigade-feat-1
		// - https://www.twitch.tv/monstercat
		return this.downloadResults(message, remaining, url.href);
	}

	/**
	 * Parses a possible track or playlist of tracks from SoundCloud.
	 * @param message The message that ran the argument.
	 * @param remaining The amount of entries the user can add.
	 * @param argument The argument to parse.
	 * @returns
	 * - `null` if neither `--sc` nor `--soundcloud` flags were provided.
	 * - `string[]` otherwise.
	 */
	private handleSoundCloud(message: GuildMessage, remaining: number, argument: string, args: Args): Promise<string[] | null> {
		if (args.getFlags('sc', 'soundcloud')) {
			return this.downloadResults(message, remaining, `scsearch: ${argument}`);
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
			if (response.loadType === LoadType.NoMatches) throw await message.resolveKey(LanguageKeys.MusicManager.FetchNoMatches);

			// Load failed: throw.
			if (response.loadType === LoadType.LoadFailed) throw await message.resolveKey(LanguageKeys.MusicManager.FetchLoadFailed);

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
		if (await isDJ(message.member)) return [...map(take(tracks.values(), remaining), (track) => track.track)];

		const [maximumDuration, allowStreams] = await readSettings(message.guild, [
			GuildSettings.Music.MaximumDuration,
			GuildSettings.Music.AllowStreams
		]);
		const filteredStreams = allowStreams ? tracks.values() : filter(tracks.values(), (track) => !track.info.isStream);
		const filteredDuration = filter(filteredStreams, (track) => track.info.length <= maximumDuration);
		const mappedTracks = map(filteredDuration, (track) => track.track);
		return [...take(mappedTracks, remaining)];
	}
}
