/* eslint-disable @typescript-eslint/unified-signatures */
import Collection, { CollectionConstructor } from '@discordjs/collection';
import { Guild } from 'discord.js';
import { createReferPromise, ReferredPromise, floatPromise } from '../util/util';
import { ModerationManagerEntry } from './ModerationManagerEntry';
import { RawModerationSettings } from '../types/settings/raw/RawModerationSettings';

enum CacheActions {
	None,
	Fetch,
	Insert
}

export class ModerationManager extends Collection<number, ModerationManagerEntry> {

	/**
	 * The Guild instance that manages this manager
	 */
	public guild: Guild;

	/**
	 * The current case count
	 */
	private _count: number | null = null;

	/**
	 * The timer that sweeps this manager's entries
	 */
	private _timer: NodeJS.Timeout | null = null;

	/**
	 * The promise to wait for tasks to complete
	 */
	private readonly _locks: ReferredPromise<undefined>[] = [];

	public get client() {
		return this.guild.client;
	}

	public constructor(guild: Guild) {
		super();
		this.guild = guild;
	}

	public create(data: ModerationManagerCreateData) {
		return new ModerationManagerEntry(this, { guild_id: this.guild.id, ...data });
	}

	public async fetch(id: number): Promise<ModerationManagerEntry | null>;
	public async fetch(id: string | number[]): Promise<Collection<number, ModerationManagerEntry>>;
	public async fetch(id?: null): Promise<this>;
	public async fetch(id?: string | number | number[] | null): Promise<ModerationManagerEntry | Collection<number, ModerationManagerEntry> | this | null> {
		// Case number
		if (typeof id === 'number') {
			return super.get(id) || this._cache(await this.guild.client.queries.fetchModerationLogByCase(this.guild.id, id), CacheActions.None);
		}

		// User id
		if (typeof id === 'string') {
			return this._count === super.size
				? super.filter(entry => entry.user === id)
				: this._cache(await this.guild.client.queries.fetchModerationLogByUser(this.guild.id, id), CacheActions.None);
		}

		if (Array.isArray(id) && id.length) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
			// @ts-ignore 2345
			return this._cache(await this.guild.client.queries.fetchModerationLogByCases(this.guild.id, id), CacheActions.None);
		}

		if (super.size !== this._count) {
			this._cache(await this.guild.client.queries.fetchModerationLogByGuild(this.guild.id), CacheActions.Fetch);
		}
		return this;
	}

	public async count() {
		if (this._count === null) await this.fetch();
		return this._count!;
	}

	public insert(data: ModerationManagerEntry | RawModerationSettings) {
		return this._cache(data, CacheActions.Insert);
	}

	public createLock() {
		const lock = createReferPromise<undefined>();
		this._locks.push(lock);
		floatPromise(this.guild, lock.promise.finally(() => {
			this._locks.splice(this._locks.indexOf(lock), 1);
		}));

		return lock.resolve;
	}

	public releaseLock() {
		for (const lock of this._locks) lock.resolve();
	}

	public waitLock() {
		return Promise.all(this._locks.map(lock => lock.promise));
	}

	private _cache(entry: ModerationManagerEntry | RawModerationSettings | null, type: CacheActions): ModerationManagerEntry;
	private _cache(entries: (ModerationManagerEntry | RawModerationSettings | null)[], type: CacheActions): Collection<number, ModerationManagerEntry>;
	private _cache(
		entries: ModerationManagerEntry | RawModerationSettings | (ModerationManagerEntry | RawModerationSettings | null)[] | null,
		type: CacheActions
	): Collection<number, ModerationManagerEntry> | ModerationManagerEntry | null {
		if (!entries) return null;

		const parsedEntries = Array.isArray(entries)
			? entries.map(entry => entry instanceof ModerationManagerEntry ? entry : new ModerationManagerEntry(this, entry!))
			: [entries instanceof ModerationManagerEntry ? entries : new ModerationManagerEntry(this, entries)];

		for (const entry of parsedEntries) {
			super.set(entry.case!, entry);
		}

		switch (type) {
			case CacheActions.Fetch: this._count = super.size;
				break;
			case CacheActions.Insert: this._count!++;
				break;
		}

		if (!this._timer) {
			this._timer = setInterval(() => {
				super.sweep(value => value.cacheExpired);
				if (!super.size) this._timer = null;
			}, 1000);
		}

		return Array.isArray(entries)
			? new Collection<number, ModerationManagerEntry>(parsedEntries.map(entry => [entry.case!, entry]))
			: parsedEntries[0];
	}

	public static get [Symbol.species]() {
		return Collection as unknown as CollectionConstructor;
	}

}

export type ModerationManagerUpdateData = Partial<Pick<RawModerationSettings, 'duration' | 'extra_data' | 'moderator_id' | 'reason'>>;
export type ModerationManagerCreateData = Omit<ModerationManagerInsertData, 'guild_id'>;
export type ModerationManagerInsertData = Pick<RawModerationSettings, 'guild_id' | 'user_id' | 'type'>
& Partial<Pick<RawModerationSettings, 'duration' | 'extra_data' | 'moderator_id' | 'reason' | 'created_at' | 'case_id'>>;
