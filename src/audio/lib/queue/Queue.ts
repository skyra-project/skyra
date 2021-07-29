/* eslint-disable @typescript-eslint/unified-signatures */
import { Events } from '#lib/types/Enums';
import { map, reverse } from '#utils/common';
import { Store } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import { isNullish } from '@sapphire/utilities';
import type { Player, Track, TrackInfo } from '@skyra/audio';
import type { Guild, TextChannel, VoiceChannel } from 'discord.js';
import type { QueueStore } from './QueueStore';

const kExpireTime = Time.Day * 2;

export interface QueueEntry {
	author: string;
	track: string;
}

export interface NP {
	entry: NowPlayingEntry;
	position: number;
}

export interface NowPlayingEntry extends QueueEntry {
	info: TrackInfo;
}

function serializeEntry(value: QueueEntry): string {
	return `${value.author} ${value.track}`;
}

function deserializeEntry(value: string): QueueEntry {
	const index = value.indexOf(' ');
	const author = value.substring(0, index);
	const track = value.substring(index + 1);
	return { author, track };
}

interface QueueKeys {
	/**
	 * Stored in reverse order: right-most (last) element is the next in queue
	 */
	readonly next: string;
	readonly position: string;

	/**
	 * Left-most (first) element is the currently playing track,
	 */
	readonly current: string;
	readonly skips: string;
	readonly systemPause: string;
	readonly replay: string;
	readonly volume: string;
	readonly text: string;
}

export class Queue {
	public readonly keys: QueueKeys;

	public constructor(public readonly store: QueueStore, public readonly guildID: string) {
		this.keys = {
			next: `skyra.a.${this.guildID}.n`,
			position: `skyra.a.${this.guildID}.p`,
			current: `skyra.a.${this.guildID}.c`,
			skips: `skyra.a.${this.guildID}.s`,
			systemPause: `skyra.a.${this.guildID}.sp`,
			replay: `skyra.a.${this.guildID}.r`,
			volume: `skyra.a.${this.guildID}.v`,
			text: `skyra.a.${this.guildID}.t`
		};
	}

	public get client() {
		return Store.injectedContext.client;
	}

	public get player(): Player {
		return this.store.client.players.get(this.guildID);
	}

	public get playing(): boolean {
		return this.player.playing;
	}

	public get paused(): boolean {
		return this.player.paused;
	}

	public get guild(): Guild {
		return this.client.guilds.cache.get(this.guildID)!;
	}

	public get voiceChannel(): VoiceChannel | null {
		const id = this.voiceChannelID;
		return id ? (this.guild.channels.cache.get(id) as VoiceChannel) ?? null : null;
	}

	public get voiceChannelID(): string | null {
		return this.player.voiceState?.channel_id ?? null;
	}

	/**
	 * Starts the queue.
	 */
	public async start(replaying = false): Promise<boolean> {
		const np = await this.nowPlaying();
		if (!np) return this.next();

		// Play next song.
		await this.player.play(np.entry.track, { start: np.position });

		this.client.emit(replaying ? Events.MusicSongReplay : Events.MusicSongPlay, this, np);
		return true;
	}

	/**
	 * Returns whether or not there are songs that can be played.
	 */
	public async canStart(): Promise<boolean> {
		return (await this.store.redis.exists(this.keys.current, this.keys.next)) > 0;
	}

	/**
	 * Adds tracks to the end of the queue.
	 * @param tracks The tracks to be added.
	 */
	public async add(...tracks: readonly QueueEntry[]): Promise<number> {
		if (!tracks.length) return 0;
		await this.store.redis.lpush(this.keys.next, ...map(tracks.values(), serializeEntry));
		await this.refresh();
		this.client.emit(Events.MusicQueueSync, this);
		return tracks.length;
	}

	public async pause({ system = false } = {}) {
		await this.player.pause(true);
		await this.setSystemPaused(system);
		this.client.emit(Events.MusicSongPause, this);
	}

	public async resume() {
		await this.player.pause(false);
		await this.setSystemPaused(false);
		this.client.emit(Events.MusicSongResume, this);
	}

	/**
	 * Retrieves all the skip votes.
	 */
	public countSkipVotes(): Promise<number> {
		return this.store.redis.scard(this.keys.skips);
	}

	/**
	 * Empties the skip list.
	 * @param value The value to add.
	 * @returns Whether or not the votes were removed.
	 */
	public async resetSkipVotes(): Promise<boolean> {
		return this.store.redis.del(this.keys.skips).then((d) => d === 1);
	}

	/**
	 * Adds a vote.
	 * @param value The value to add to the skip list.
	 * @returns Whether or not the vote was added.
	 */
	public async addSkipVote(value: string): Promise<boolean> {
		const result = await this.store.redis.sadd(this.keys.skips, value).then((d) => d === 1);
		if (result) await this.refresh();
		return result;
	}

	/**
	 * Retrieves whether or not the queue was paused automatically.
	 */
	public getSystemPaused(): Promise<boolean> {
		return this.store.redis.get(this.keys.systemPause).then((d) => d === '1');
	}

	/**
	 * Sets the system pause mode.
	 * @param value Whether or not the queue should be paused automatically.
	 */
	public async setSystemPaused(value: boolean): Promise<boolean> {
		await this.store.redis.set(this.keys.systemPause, value ? '1' : '0');
		await this.refresh();
		this.client.emit(Events.MusicSongPause, this, value);
		return value;
	}

	/**
	 * Retrieves whether or not the system should repeat the current track.
	 */
	public async getReplay(): Promise<boolean> {
		const d = await this.store.redis.get(this.keys.replay);
		return d === '1';
	}

	/**
	 * Sets the repeat mode.
	 * @param value Whether or not the system should repeat the current track.
	 */
	public async setReplay(value: boolean): Promise<boolean> {
		await this.store.redis.set(this.keys.replay, value ? '1' : '0');
		await this.refresh();
		this.client.emit(Events.MusicReplayUpdate, this, value);
		return value;
	}

	/**
	 * Retrieves the volume of the track in the queue.
	 */
	public async getVolume(): Promise<number> {
		const raw = await this.store.redis.get(this.keys.volume);
		return raw ? Number(raw) : 100;
	}

	/**
	 * Sets the volume.
	 * @param value The new volume for the queue.
	 */
	public async setVolume(value: number): Promise<{ previous: number; next: number }> {
		await this.player.setVolume(value);
		const previous = await this.store.redis.getset(this.keys.volume, value);
		await this.refresh();

		this.client.emit(Events.MusicSongVolumeUpdate, this, value);
		return { previous: previous === null ? 100 : Number(previous), next: value };
	}

	/**
	 * Sets the seek position in the track.
	 * @param position The position in milliseconds in the track.
	 */
	public async seek(position: number): Promise<void> {
		await this.player.seek(position);
		this.client.emit(Events.MusicSongSeekUpdate, this, position);
	}

	/**
	 * Connects to a voice channel.
	 * @param channelID The [[VoiceChannel]] to connect to.
	 */
	public async connect(channelID: string): Promise<void> {
		await this.player.join(channelID, { deaf: true });
		this.client.emit(Events.MusicConnect, this, channelID);
	}

	/**
	 * Leaves the voice channel.
	 */
	public async leave(): Promise<void> {
		await this.player.leave();
		await this.setTextChannelID(null);
		this.client.emit(Events.MusicLeave, this);
	}

	public async getTextChannel(): Promise<TextChannel | null> {
		const id = await this.getTextChannelID();
		if (id === null) return null;

		const channel = this.guild.channels.cache.get(id) ?? null;
		if (channel === null) {
			await this.setTextChannelID(null);
			return null;
		}

		return channel as TextChannel;
	}

	/**
	 * Gets the text channel from cache.
	 */
	public getTextChannelID(): Promise<string | null> {
		return this.store.redis.get(this.keys.text);
	}

	/**
	 * Unsets the notifications channel.
	 */
	public setTextChannelID(channelID: null): Promise<null>;

	/**
	 * Sets a text channel to send notifications to.
	 * @param channelID The text channel to set.
	 */
	public async setTextChannelID(channelID: string): Promise<string>;
	public async setTextChannelID(channelID: string | null): Promise<string | null> {
		if (channelID === null) {
			await this.store.redis.del(this.keys.text);
		} else {
			await this.store.redis.set(this.keys.text, channelID);
			await this.refresh();
		}

		return channelID;
	}

	/**
	 * Retrieves the current track.
	 */
	public async getCurrentTrack(): Promise<QueueEntry | null> {
		const value = await this.store.redis.get(this.keys.current);
		return value ? deserializeEntry(value) : null;
	}

	/**
	 * Retrieves an element from the queue.
	 * @param index The index at which to retrieve the element.
	 */
	public async getAt(index: number): Promise<QueueEntry | null> {
		const value = await this.store.redis.lindex(this.keys.next, -index - 1);
		return value ? deserializeEntry(value) : null;
	}

	/**
	 * Removes a track at the specified index.
	 * @param position The position of the element to remove.
	 */
	public async removeAt(position: number): Promise<void> {
		await this.store.redis.lremat(this.keys.next, -position - 1);
		await this.refresh();
		this.client.emit(Events.MusicQueueSync, this);
	}

	/**
	 * Skips to the next song, pass negatives to advance in reverse, or 0 to repeat.
	 * @returns Whether or not the queue is not empty.
	 */
	public async next({ skipped = false } = {}): Promise<boolean> {
		// Sets the current position to 0.
		await this.store.redis.del(this.keys.position);

		// Get whether or not the queue is on replay mode.
		const replaying = await this.getReplay();

		// If not skipped (song ended) and is replaying, replay.
		if (!skipped && replaying) {
			return this.start(true);
		}

		// If it was skipped, set replay back to false.
		if (replaying) await this.setReplay(false);

		// Removes the next entry from the list and sets it as the current track.
		const entry = await this.store.redis.rpopset(this.keys.next, this.keys.current);

		// If there was an entry to play, refresh the state and start playing.
		if (entry) {
			if (skipped) this.client.emit(Events.MusicSongSkip, this, deserializeEntry(entry));
			await this.resetSkipVotes();
			await this.refresh();
			return this.start(false);
		}

		// We're at the end of the queue, so clear everything out.
		this.client.emit(Events.MusicFinish, this);
		return false;
	}

	/**
	 * Retrieves the length of the queue.
	 */
	public count(): Promise<number> {
		return this.store.redis.llen(this.keys.next);
	}

	/**
	 * Moves a track by index from a position to another.
	 * @param from The position of the track to move.
	 * @param to The position of the new position for the track.
	 */
	public async moveTracks(from: number, to: number): Promise<void> {
		await this.store.redis.lmove(this.keys.next, -from - 1, -to - 1); // work from the end of the list, since it's reversed
		await this.refresh();
		this.client.emit(Events.MusicQueueSync, this);
	}

	/**
	 * Shuffles the queue.
	 */
	public async shuffleTracks(): Promise<void> {
		await this.store.redis.lshuffle(this.keys.next, Date.now());
		await this.refresh();
		this.client.emit(Events.MusicQueueSync, this);
	}

	/**
	 * Stops the playback.
	 */
	public async stop(): Promise<void> {
		await this.player.stop();
	}

	/**
	 * Clear all the tracks from the queue.
	 */
	public async clearTracks(): Promise<void> {
		await this.store.redis.del(this.keys.next);
		this.client.emit(Events.MusicQueueSync, this);
	}

	public refresh() {
		return this.store.redis
			.pipeline()
			.pexpire(this.keys.next, kExpireTime)
			.pexpire(this.keys.position, kExpireTime)
			.pexpire(this.keys.current, kExpireTime)
			.pexpire(this.keys.skips, kExpireTime)
			.pexpire(this.keys.systemPause, kExpireTime)
			.pexpire(this.keys.replay, kExpireTime)
			.pexpire(this.keys.volume, kExpireTime)
			.pexpire(this.keys.text, kExpireTime)
			.exec();
	}

	/**
	 * Clears the entire queue's state.
	 */
	public clear(): Promise<number> {
		return this.store.redis.del(
			this.keys.next,
			this.keys.position,
			this.keys.current,
			this.keys.skips,
			this.keys.systemPause,
			this.keys.replay,
			this.keys.volume,
			this.keys.text
		);
	}

	/**
	 * Gets the current track and position.
	 */
	public async nowPlaying(): Promise<NP | null> {
		const [entry, position] = await Promise.all([this.getCurrentTrack(), this.store.redis.get(this.keys.position)]);
		if (entry === null) return null;

		const info = await this.player.node.decode(entry.track);

		return { entry: { ...entry, info }, position: isNullish(position) ? 0 : parseInt(position, 10) };
	}

	public async tracks(start = 0, end = -1): Promise<QueueEntry[]> {
		if (end === Infinity) end = -1;

		const tracks = await this.store.redis.lrange(this.keys.next, start, end);
		return [...map(reverse(tracks), deserializeEntry)];
	}

	public async decodedTracks(start = 0, end = -1): Promise<Track[]> {
		const tracks = await this.tracks(start, end);
		return this.player.node.decode(tracks.map((track) => track.track));
	}
}
