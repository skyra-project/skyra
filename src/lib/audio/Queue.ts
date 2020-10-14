import { Player } from '@skyra/audio';
import { EventEmitter } from 'events';
import { ExtendedRedis, QueueStore } from './QueueStore';

export interface NP {
	position: number;
	track: string;
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
					await this._next({ count, previous: d });
				} catch (e) {
					this.store.client.emit('error', e);
				}
			}
		});

		this.on('playerUpdate', async (d) => {
			try {
				await this._redis.set(this.keys.pos, d.state.position);
			} catch (e) {
				this.store.client.emit('error', e);
			}
		});
	}

	public get player(): Player {
		return this.store.client.players.get(this.guildID);
	}

	public async start(): Promise<boolean> {
		const np = await this.current();
		if (!np) return this._next();

		await this.player.play(np.track, { start: np.position });
		return true;
	}

	public add(...tracks: string[]): Promise<number> {
		if (!tracks.length) return Promise.resolve(0);
		return this._redis.lpush(this.keys.next, ...tracks);
	}

	public unshift(...tracks: string[]): Promise<number> {
		if (!tracks.length) return Promise.resolve(0);
		return this._redis.rpush(this.keys.next, ...tracks);
	}

	public remove(track: string): PromiseLike<number> {
		return this._redis.lrem(this.keys.next, 1, track);
	}

	public next(count = 1): Promise<boolean> {
		return this._next({ count });
	}

	public length(): PromiseLike<number> {
		return this._redis.llen(this.keys.next);
	}

	public async sort(predicate?: (a: string, b: string) => number): Promise<number> {
		const tracks = await this.tracks();
		tracks.sort(predicate);
		return this._redis.loverride(this.keys.next, ...tracks);
	}

	public async move(from: number, to: number): Promise<string[]> {
		const list = await this._redis.lmove(this.keys.next, -from - 1, -to - 1); // work from the end of the list, since it's reversed
		return list.reverse();
	}

	public shuffle(): Promise<string[]> {
		return this._redis.lshuffle(this.keys.next, Date.now());
	}

	public splice(start: number, deleteCount?: number, ...tracks: string[]): Promise<string[]> {
		return this._redis.lrevsplice(this.keys.next, start, deleteCount, ...tracks);
	}

	public trim(start: number, end: number): PromiseLike<string> {
		return this._redis.ltrim(this.keys.next, start, end);
	}

	public async stop() {
		await this.player.stop();
	}

	public clear(): Promise<number> {
		return this._redis.del(this.keys.next, this.keys.prev, this.keys.pos);
	}

	public async current(): Promise<NP | null> {
		const [track, position] = await Promise.all([this._redis.lindex(this.keys.prev, 0), this._redis.get(this.keys.pos)]);
		return track ? { track, position: parseInt(position!, 10) || 0 } : null;
	}

	public async tracks(start = 0, end = -1): Promise<string[]> {
		if (end === Infinity) end = -1;

		const tracks = await this._redis.lrange(this.keys.next, start, end);
		return tracks.reverse();
	}

	protected async _next({ count, previous }: { count?: number; previous?: NP | null } = {}): Promise<boolean> {
		await this._redis.set(this.keys.pos, 0);

		if (!previous) previous = await this.current();
		if (count === undefined && previous) {
			const length = await this.length();
			count = this.store.client.advanceBy(this, { previous: previous.track, remaining: length });
		}
		if (count === 0) return this.start();

		const skipped = await this._redis.multirpoplpush(this.keys.next, this.keys.prev, count || 1);
		if (skipped.length) return this.start();

		await this.clear(); // we're at the end of the queue, so clear everything out
		return false;
	}

	protected get _redis(): ExtendedRedis {
		return this.store.redis;
	}
}
