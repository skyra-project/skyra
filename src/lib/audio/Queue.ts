/* eslint-disable @typescript-eslint/unified-signatures */
import { map, reverse } from '@lib/misc';
import { Events } from '@lib/types/Enums';
import { Player } from '@skyra/audio';
import { EventEmitter } from 'events';
import { QueueStore } from './QueueStore';

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
	readonly replay: string;
	readonly volume: string;
	readonly text: string;
}

export class Queue extends EventEmitter {
	public readonly keys: QueueKeys;

	public constructor(public readonly store: QueueStore, public readonly guildID: string) {
		super();
		this.keys = {
			next: `skyra.a.${this.guildID}.n`, // stored in reverse order: right-most (last) element is the next in queue
			position: `skyra.a.${this.guildID}.p`,
			current: `skyra.a.${this.guildID}.c`, // left-most (first) element is the currently playing track,
			replay: `skyra.a.${this.guildID}.r`,
			volume: `skyra.a.${this.guildID}.v`,
			text: `skyra.a.${this.guildID}.t`
		};

		this.on('event', async (d) => {
			// if the track wasn't replaced or manually stopped, continue playing the next song
			if (
				!['TrackEndEvent', 'TrackStartEvent', 'WebSocketClosedEvent'].includes(d.type) ||
				(d.type === 'TrackEndEvent' && !['REPLACED', 'STOPPED'].includes(d.reason))
			) {
				let count = d.type === 'TrackEndEvent' ? undefined : 1;
				try {
					await this.handleNext({ count, previous: d });
				} catch (e) {
					this.store.client.emit('error', e);
				}
			}
		});

		this.on('playerUpdate', async (d) => {
			try {
				await this.store.redis.set(this.keys.position, d.state.position);
			} catch (e) {
				this.store.client.emit('error', e);
			}
		});
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

	public get voiceChannelID(): string | null {
		return this.player.voiceState?.channel_id ?? null;
	}

	/**
	 * Starts the queue.
	 */
	public async start(): Promise<boolean> {
		const np = await this.current();
		if (!np) return this.handleNext();

		// Emit to the websocket that we skipped a song.
		this.store.client.emit(Events.MusicSongSkip, this, np.entry);

		// Play next song.
		await this.player.play(np.entry.track, { start: np.position });
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
	public async add(...tracks: QueueEntry[]): Promise<number> {
		if (!tracks.length) return 0;
		await this.store.redis.lpush(this.keys.next, ...map(tracks.values(), serializeEntry));
		this.store.client.emit(Events.MusicAdd, this, tracks);
		return tracks.length;
	}

	public async pause() {
		const { player } = this;
		if (player.playing && !player.paused) {
			await player.pause(true);
			// this.systemPaused = systemPaused;
			this.store.client.emit(Events.MusicSongPause, this);
		}
	}

	public async resume() {
		if (this.playing && this.paused) {
			await this.player.pause(false);
			this.store.client.emit(Events.MusicSongResume, this);
		}
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
		this.store.client.emit(Events.MusicReplayUpdate, this, value);
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
	public volume(value: number): Promise<number>;
	public async volume(value?: number): Promise<number> {
		if (typeof value === 'undefined') {
			const raw = await this.store.redis.get(this.keys.volume);
			return raw ? Number(raw) : 100;
		}

		await this.store.redis.set(this.keys.volume, value);
		this.store.client.emit(Events.MusicSongVolumeUpdate, this, value);
		return value;
	}

	/**
	 * Sets the seek position in the track.
	 * @param position The position in milliseconds in the track.
	 */
	public async seek(position: number): Promise<void> {
		await this.player.seek(position);
		this.store.client.emit(Events.MusicSongSeekUpdate, this, position);
	}

	/**
	 * Connects to a voice channel.
	 * @param channelID The [[VoiceChannel]] to connect to.
	 */
	public async connect(channelID: string): Promise<void> {
		await this.player.join(channelID, { deaf: true });
		this.store.client.emit(Events.MusicConnect, this, channelID);
	}

	/**
	 * Leaves the voice channel.
	 */
	public async leave(): Promise<void> {
		await this.player.leave();
		await this.textChannel(null);
		this.store.client.emit(Events.MusicLeave, this);
	}

	/**
	 * Gets the text channel from cache.
	 */
	public textChannel(): Promise<string | null>;

	/**
	 * Unsets the notifications channel.
	 */
	public textChannel(channelID: null): Promise<null>;

	/**
	 * Sets a text channel to send notifications to.
	 * @param channelID The text channel to set.
	 */
	public async textChannel(channelID: string): Promise<string>;
	public async textChannel(channelID?: string | null): Promise<string | null> {
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
	public removeAt(position: number): Promise<'OK'> {
		return this.store.redis.lremat(this.keys.next, -position - 1);
	}

	/**
	 * Skips to the next song, pass negatives to advance in reverse, or 0 to repeat.
	 * @param count The amount of songs to skip.
	 * @returns Whether or not the queue is not empty.
	 */
	public next(count = 1): Promise<boolean> {
		return this.handleNext({ count });
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
		return this.store.redis.del(this.keys.next, this.keys.position, this.keys.current, this.keys.replay, this.keys.volume, this.keys.text);
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

	protected async handleNext({ count, previous }: { count?: number; previous?: NP | null } = {}): Promise<boolean> {
		// Sets the current position to 0.
		await this.store.redis.set(this.keys.position, 0);

		if (!previous) previous = await this.current();
		if (count === undefined && previous) count = (await this.replay()) ? 0 : 1;
		if (count === 0) return this.start();

		const skipped = await this.store.redis.rpopset(this.keys.next, this.keys.current);
		if (skipped) return this.start();

		await this.clear(); // we're at the end of the queue, so clear everything out
		return false;
	}
}
