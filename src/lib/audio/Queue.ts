/* eslint-disable @typescript-eslint/unified-signatures */
import { map, reverse } from '@lib/misc';
import type { SkyraClient } from '@lib/SkyraClient';
import { Events } from '@lib/types/Enums';
import type { Player, Track } from '@skyra/audio';
import type { Guild, TextChannel, VoiceChannel } from 'discord.js';
import { container } from 'tsyringe';
import type { QueueStore } from './QueueStore';

export interface QueueEntry {
	author: string;
	track: string;
}

export interface NP {
	entry: QueueEntry;
	position: number;
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
	readonly next: string;
	readonly position: string;
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
			next: `skyra.a.${this.guildID}.n`, // stored in reverse order: right-most (last) element is the next in queue
			position: `skyra.a.${this.guildID}.p`,
			current: `skyra.a.${this.guildID}.c`, // left-most (first) element is the currently playing track,
			skips: `skyra.a.${this.guildID}.s`,
			systemPause: `skyra.a.${this.guildID}.sp`,
			replay: `skyra.a.${this.guildID}.r`,
			volume: `skyra.a.${this.guildID}.v`,
			text: `skyra.a.${this.guildID}.t`
		};
	}

	public get client(): SkyraClient {
		return container.resolve<SkyraClient>('SkyraClient');
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
		const np = await this.current();
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
		return (await this.current()) !== null || (await this.length()) !== 0;
	}

	/**
	 * Adds tracks to the end of the queue.
	 * @param tracks The tracks to be added.
	 */
	public async add(...tracks: readonly QueueEntry[]): Promise<number> {
		if (!tracks.length) return 0;
		await this.store.redis.lpush(this.keys.next, ...map(tracks.values(), serializeEntry));
		this.client.emit(Events.MusicQueueSync, this);
		return tracks.length;
	}

	public async pause({ system = false } = {}) {
		await this.player.pause(true);
		await this.systemPaused(system);
		this.client.emit(Events.MusicSongPause, this);
	}

	public async resume() {
		await this.player.pause(false);
		await this.systemPaused(false);
		this.client.emit(Events.MusicSongResume, this);
	}

	/**
	 * Retrieves all the skip votes.
	 */
	public skips(): Promise<string[]>;

	/**
	 * Empties the skip list.
	 * @param value The value to add.
	 * @returns Whether or not the votes were removed.
	 */
	public skips(value: null): Promise<boolean>;

	/**
	 * Adds a vote.
	 * @param value The value to add to the skip list.
	 * @returns Whether or not the vote was added.
	 */
	public skips(value: string): Promise<boolean>;
	public async skips(value?: string | null): Promise<boolean | string[]> {
		if (typeof value === 'undefined') {
			return this.store.redis.smembers(this.keys.skips);
		}

		if (value === null) {
			return (await this.store.redis.del(this.keys.skips)) === 1;
		}

		return (await this.store.redis.sadd(this.keys.skips, value)) === 1;
	}

	/**
	 * Retrieves whether or not the queue was paused automatically.
	 */
	public systemPaused(): Promise<boolean>;

	/**
	 * Sets the system pause mode.
	 * @param value Whether or not the queue should be paused automatically.
	 */
	public systemPaused(value: boolean): Promise<boolean>;
	public async systemPaused(value?: boolean): Promise<boolean> {
		if (typeof value === 'undefined') {
			return (await this.store.redis.get(this.keys.systemPause)) === '1';
		}

		await this.store.redis.set(this.keys.systemPause, value ? '1' : '0');
		this.client.emit(Events.MusicSongPause, this, value);
		return value;
	}

	/**
	 * Retrieves whether or not the system should repeat the current track.
	 */
	public replay(): Promise<boolean>;

	/**
	 * Sets the repeat mode.
	 * @param value Whether or not the system should repeat the current track.
	 */
	public replay(value: boolean): Promise<boolean>;
	public async replay(value?: boolean): Promise<boolean> {
		if (typeof value === 'undefined') {
			return (await this.store.redis.get(this.keys.replay)) === '1';
		}

		await this.store.redis.set(this.keys.replay, value ? '1' : '0');
		this.client.emit(Events.MusicReplayUpdate, this, value);
		return value;
	}

	/**
	 * Retrieves the volume of the track in the queue.
	 */
	public volume(): Promise<number>;

	/**
	 * Sets the volume.
	 * @param value The new volume for the queue.
	 */
	public volume(value: number): Promise<{ previous: number; next: number }>;
	public async volume(value?: number): Promise<number | { previous: number; next: number }> {
		if (typeof value === 'undefined') {
			const raw = await this.store.redis.get(this.keys.volume);
			return raw ? Number(raw) : 100;
		}

		const previous = await this.store.redis.getset(this.keys.volume, value);
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
		await this.textChannelID(null);
		this.client.emit(Events.MusicLeave, this);
	}

	public async textChannel(): Promise<TextChannel | null> {
		const id = await this.textChannelID();
		if (id === null) return null;

		const channel = this.guild.channels.cache.get(id) ?? null;
		if (channel === null) {
			await this.textChannelID(null);
			return null;
		}

		return channel as TextChannel;
	}

	/**
	 * Gets the text channel from cache.
	 */
	public textChannelID(): Promise<string | null>;

	/**
	 * Unsets the notifications channel.
	 */
	public textChannelID(channelID: null): Promise<null>;

	/**
	 * Sets a text channel to send notifications to.
	 * @param channelID The text channel to set.
	 */
	public async textChannelID(channelID: string): Promise<string>;
	public async textChannelID(channelID?: string | null): Promise<string | null> {
		if (typeof channelID === 'undefined') {
			return this.store.redis.get(this.keys.text);
		}

		await (channelID === null ? this.store.redis.del(this.keys.text) : this.store.redis.set(this.keys.text, channelID));
		return channelID;
	}

	/**
	 * Retrieves an element from the queue.
	 * @param index The index at which to retrieve the element.
	 */
	public get(index: number): Promise<QueueEntry> {
		return this.store.redis.lindex(this.keys.next, index).then(deserializeEntry);
	}

	/**
	 * Removes a track at the specified index.
	 * @param position The position of the element to remove.
	 */
	public async removeAt(position: number): Promise<void> {
		await this.store.redis.lremat(this.keys.next, -position - 1);
		this.client.emit(Events.MusicQueueSync, this);
	}

	/**
	 * Skips to the next song, pass negatives to advance in reverse, or 0 to repeat.
	 * @returns Whether or not the queue is not empty.
	 */
	public async next({ skipped = false } = {}): Promise<boolean> {
		// Sets the current position to 0.
		await this.store.redis.set(this.keys.position, 0);

		if (await this.replay()) {
			return this.start(true);
		}

		const entry = await this.store.redis.rpopset(this.keys.next, this.keys.current);
		if (entry) {
			if (skipped) this.client.emit(Events.MusicSongSkip, this, deserializeEntry(entry));
			await this.skips(null);
			return this.start(false);
		}

		await this.clear(); // we're at the end of the queue, so clear everything out
		return false;
	}

	/**
	 * Retrieves the length of the queue.
	 */
	public length(): Promise<number> {
		return this.store.redis.llen(this.keys.next);
	}

	/**
	 * Moves a track by index from a position to another.
	 * @param from The position of the track to move.
	 * @param to The position of the new position for the track.
	 */
	public async move(from: number, to: number): Promise<void> {
		await this.store.redis.lmove(this.keys.next, -from - 1, -to - 1); // work from the end of the list, since it's reversed
	}

	/**
	 * Shuffles the queue.
	 */
	public async shuffle(): Promise<void> {
		await this.store.redis.lshuffle(this.keys.next, Date.now());
	}

	/**
	 * Stops the playback.
	 */
	public async stop() {
		await this.player.stop();
	}

	/**
	 * Clears the queue.
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
	public async current(): Promise<NP | null> {
		const [entry, position] = await Promise.all([
			this.store.redis.get(this.keys.current).then((v) => (v ? deserializeEntry(v) : null)),
			this.store.redis.get(this.keys.position)
		]);
		return entry ? { entry, position: parseInt(position!, 10) || 0 } : null;
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
