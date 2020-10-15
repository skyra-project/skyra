import { map, reverse } from '@lib/misc';
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

export class Queue extends EventEmitter {
	public readonly keys: { next: string; pos: string; prev: string };

	public constructor(public readonly store: QueueStore, public readonly guildID: string) {
		super();
		this.keys = {
			next: `playlists.${this.guildID}.next`, // stored in reverse order: right-most (last) element is the next in queue
			pos: `playlists.${this.guildID}.pos`,
			prev: `playlists.${this.guildID}.prev` // left-most (first) element is the currently playing track
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
				await this.store.redis.set(this.keys.pos, d.state.position);
			} catch (e) {
				this.store.client.emit('error', e);
			}
		});
	}

	public get player(): Player {
		return this.store.client.players.get(this.guildID);
	}

	/**
	 * Starts the queue.
	 */
	public async start(): Promise<boolean> {
		const np = await this.current();
		if (!np) return this.handleNext();

		await this.player.play(np.entry.track, { start: np.position });
		return true;
	}

	/**
	 * Adds tracks to the end of the queue.
	 * @param tracks The tracks to be added.
	 */
	public add(...tracks: QueueEntry[]): Promise<number> {
		if (!tracks.length) return Promise.resolve(0);
		return this.store.redis.lpush(this.keys.next, ...map(tracks.values(), serializeEntry));
	}

	/**
	 * Adds tracks to the start of the queue.
	 * @param tracks The tracks to be added.
	 */
	public unshift(...tracks: QueueEntry[]): Promise<number> {
		if (!tracks.length) return Promise.resolve(0);
		return this.store.redis.rpush(this.keys.next, ...map(tracks.values(), serializeEntry));
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
	public move(from: number, to: number): Promise<'OK'> {
		return this.store.redis.lmove(this.keys.next, -from - 1, -to - 1); // work from the end of the list, since it's reversed
	}

	/**
	 * Shuffles the queue.
	 */
	public shuffle(): Promise<'OK'> {
		return this.store.redis.lshuffle(this.keys.next, Date.now());
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
		return this.store.redis.del(this.keys.next, this.keys.prev, this.keys.pos);
	}

	/**
	 * Gets the current track and position.
	 */
	public async current(): Promise<NP | null> {
		const [entry, position] = await Promise.all([
			this.store.redis.lindex(this.keys.prev, 0).then(deserializeEntry),
			this.store.redis.get(this.keys.pos)
		]);
		return entry ? { entry, position: parseInt(position!, 10) || 0 } : null;
	}

	public async tracks(start = 0, end = -1): Promise<QueueEntry[]> {
		if (end === Infinity) end = -1;

		const tracks = await this.store.redis.lrange(this.keys.next, start, end);
		return [...map(reverse(tracks), deserializeEntry)];
	}

	protected async handleNext({ count, previous }: { count?: number; previous?: NP | null } = {}): Promise<boolean> {
		await this.store.redis.set(this.keys.pos, 0);

		if (!previous) previous = await this.current();
		if (count === undefined && previous) {
			const length = await this.length();
			count = this.store.client.advanceBy(this, { previous: previous.entry.track, remaining: length });
		}
		if (count === 0) return this.start();

		const skipped = await this.store.redis.multirpoplpush(this.keys.next, this.keys.prev, count ?? 1);
		if (skipped) return this.start();

		await this.clear(); // we're at the end of the queue, so clear everything out
		return false;
	}
}
