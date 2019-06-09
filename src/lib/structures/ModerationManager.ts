/* eslint-disable @typescript-eslint/unified-signatures */

import { Collection, Guild, User } from 'discord.js';
import { Databases } from '../types/constants/Constants';
import { ModerationActions, ModerationErrors, ModerationSchemaKeys } from '../util/constants';
import { createReferPromise, ReferredPromise } from '../util/util';
import { ModerationManagerEntry, ModerationManagerEntrySerialized, ModerationManagerEntryDeserialized } from './ModerationManagerEntry';

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

	public constructor(guild: Guild) {
		super();
		this.guild = guild;
	}

	public get pool() {
		return this.guild!.client.providers.default.db;
	}

	public get table() {
		return this.guild!.client.providers.default.db.table(Databases.Moderation);
	}

	public get new() {
		// eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
		return new ModerationManagerEntry(this, {} as ModerationManagerEntrySerialized);
	}

	public async fetch(id: number): Promise<ModerationManagerEntry>;
	public async fetch(id: string | number[]): Promise<Collection<number, ModerationManagerEntry>>;
	public async fetch(id?: null): Promise<this>;
	public async fetch(id?: string | number | number[] | null): Promise<ModerationManagerEntry | Collection<number, ModerationManagerEntry> | this> {
		// Case number
		if (typeof id === 'number') {
			return super.get(id) || this._cache(await this.table.getAll([this.guild!.id, id], { index: 'guild_case' })
				.limit(1)
				.nth(0)
				.default(null)
				.run(), CacheActions.None);
		}

		// User id
		if (typeof id === 'string') {
			return this._count === super.size
				? super.filter(entry => entry.user === id)
				: this._cache((await this.table.getAll([this.guild!.id, id], { index: 'guild_user' })
					.orderBy(this.pool.asc(ModerationSchemaKeys.Case))
					.run()) as ModerationManagerEntryDeserialized[], CacheActions.None);
		}

		if (Array.isArray(id) && id.length) {
			// @ts-ignore
			return this._cache(await this.table.getAll(...id.map(entryID => [this.guild!.id, entryID]), { index: 'guild_case' })
				.run(), CacheActions.None);
		}

		if (super.size !== this._count) {
			this._cache(await this.table.getAll(this.guild!.id, { index: 'guildID' })
				.orderBy(this.pool.asc(ModerationSchemaKeys.Case))
				.run(), CacheActions.Fetch);
		}
		return this;
	}

	public async count() {
		if (this._count === null) await this.fetch();
		return this._count!;
	}

	public async update(data: ModerationManagerUpdateData | ModerationManagerEntry) {
		if (!data.id && ModerationSchemaKeys.Case in data) data.id = (await this.fetch(data[ModerationSchemaKeys.Case] as number) || { id: null }).id;
		if (!data.id) throw new Error('A id has not been specified and cannot be found.');
		await this.table.get(data.id).update(data).run();
	}

	public insert(data: ModerationManagerEntry | ModerationManagerEntrySerialized) {
		return this._cache(data, CacheActions.Insert);
	}

	public async appeal(data: ModerationManagerUpdateData | ModerationManagerEntry) {
		let entry;
		if ('id' in data) {
			entry = await this.table.get(data.id).default(null).run();
		} else if (ModerationSchemaKeys.Case in data) {
			entry = await this.fetch(data[ModerationSchemaKeys.Case]);
		} else if (ModerationSchemaKeys.User in data) {
			entry = (await this.fetch(data[ModerationSchemaKeys.User] as string)).find(log => !(log[ModerationSchemaKeys.Type]! & ModerationActions.Appealed));
		} else {
			throw new Error('Expected the entry id, case, or user. Got none of them.');
		}

		if (!entry || entry[ModerationSchemaKeys.Guild] !== this.guild!.id) throw new Error(ModerationErrors.CaseNotExists);
		if (entry[ModerationSchemaKeys.Type] & ModerationActions.Appealed) throw new Error(ModerationErrors.CaseAppealed);

		entry[ModerationSchemaKeys.Type] |= ModerationActions.Appealed;
		entry[ModerationSchemaKeys.Type] &= ~ModerationActions.Temporary;
		await this.table.get(entry.id).update(entry).run();

		return entry;
	}

	public createLock() {
		const lock = createReferPromise<undefined>();
		this._locks.push(lock);
		// eslint-disable-next-line promise/catch-or-return
		lock.promise.finally(() => {
			this._locks.splice(this._locks.indexOf(lock), 1);
		});

		return lock.resolve;
	}

	public releaseLock() {
		for (const lock of this._locks) lock.resolve();
	}

	public waitLock() {
		return Promise.all(this._locks.map(lock => lock.promise));
	}

	private _cache(entry: ModerationManagerEntry | ModerationManagerEntrySerialized, type: CacheActions): ModerationManagerEntry;
	private _cache(entries: (ModerationManagerEntry | ModerationManagerEntrySerialized)[], type: CacheActions): Collection<number, ModerationManagerEntry>;
	private _cache(
		entries: ModerationManagerEntry | ModerationManagerEntrySerialized | (ModerationManagerEntry | ModerationManagerEntrySerialized)[] | null,
		type: CacheActions
	): Collection<number, ModerationManagerEntry> | ModerationManagerEntry | null {
		if (!entries) return null;

		const parsedEntries = Array.isArray(entries)
			? entries.map(entry => entry instanceof ModerationManagerEntry ? entry : new ModerationManagerEntry(this, entry))
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
		return Collection;
	}

}

export interface ModerationManagerUpdateData {
	id?: string;
	[ModerationSchemaKeys.Duration]?: number | null;
	[ModerationSchemaKeys.ExtraData]?: object | null;
	[ModerationSchemaKeys.Moderator]?: string | User | null;
	[ModerationSchemaKeys.Reason]?: string | null;
}
