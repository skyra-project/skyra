/* eslint "no-bitwise": "off" */
import { Collection, Guild, User } from 'discord.js';
import { R, RTable } from 'rethinkdb-ts';
import { ModerationActions, ModerationErrors, ModerationSchemaKeys, ModerationTypeKeys } from '../util/constants';
import { createReferPromise, ReferredPromise } from '../util/util';
import { ModerationManagerEntry } from './ModerationManagerEntry';

const TABLENAME = 'moderation';

export class ModerationManager extends Collection<number, ModerationManagerEntry> {

	/**
	 * The Guild instance that manages this manager
	 */
	public guild: Guild;

	/**
	 * The current case count
	 */
	private _count: number = null;

	/**
	 * The timer that sweeps this manager's entries
	 */
	private _timer: NodeJS.Timeout = null;

	/**
	 * The promise to wait for tasks to complete
	 */
	private _locks: ReferredPromise<undefined>[] = [];

	public constructor(guild: Guild) {
		super();
		this.guild = guild;
	}

	public get pool(): R {
		return this.guild.client.providers.default.db;
	}

	public get table(): RTable<any> {
		return this.guild.client.providers.default.db.table(TABLENAME);
	}

	public get new(): ModerationManagerEntry {
		return new ModerationManagerEntry(this, {} as ModerationManagerInsertData);
	}

	public async fetch(id: string | number[]): Promise<ModerationManagerEntry[]>;
	public async fetch(id?: []): Promise<this>;
	public async fetch(id: number): Promise<ModerationManagerEntry>;
	public async fetch(id?: string | number | number[]): Promise<ModerationManagerEntry | ModerationManagerEntry[] | Collection<number, ModerationManagerEntry> | this> {
		// Case number
		if (typeof id === 'number') {
			return super.get(id) || this._cache(await this.table.getAll([this.guild.id, id], { index: 'guild_case' })
				.limit(1)
				.nth(0)
				.default(null)
				.run());
		}

		// User id
		if (typeof id === 'string') {
			return this._count === super.size
				? super.filter((entry) => entry.user === id)
				: this._cache((await this.table.getAll([this.guild.id, id], { index: 'guild_user' })
					.orderBy(this.pool.asc(ModerationSchemaKeys.Case))
					.run()) as ModerationManagerInsertData[], CacheActions.None);
		}

		if (Array.isArray(id) && id.length) {
			// @ts-ignore
			return this._cache(await this.table.getAll(...id.map((entryID) => [this.guild.id, entryID]), { index: 'guild_case' })
				.run());
		}

		if (super.size !== this._count) {
			this._cache(await this.table.getAll(this.guild.id, { index: 'guildID' })
				.orderBy(this.pool.asc(ModerationSchemaKeys.Case))
				.run(), CacheActions.Fetch);
		}
		return this;
	}

	public async count(): Promise<number> {
		if (this._count === null) await this.fetch();
		return this._count;
	}

	public async update(data: ModerationManagerUpdateData | ModerationManagerEntry): Promise<void> {
		if (!data.id && ModerationSchemaKeys.Case in data) data.id = (await this.fetch(data[ModerationSchemaKeys.Case] as number) || { id: null }).id;
		if (!data.id) throw new Error('A id has not been specified and cannot be found.');
		await this.table.get(data.id).update(data).run();
	}

	public insert(data: ModerationManagerInsertData | ModerationManagerEntry): ModerationManagerEntry {
		return this._cache(data, CacheActions.Insert);
	}

	public async appeal(data: ModerationManagerUpdateData | ModerationManagerEntry): Promise<ModerationManagerEntry> {
		let entry;
		if ('id' in data) entry = await this.table.get(data.id).default(null).run();
		else if (ModerationSchemaKeys.Case in data) entry = await this.fetch(data[ModerationSchemaKeys.Case]);
		else if (ModerationSchemaKeys.User in data) entry = (await this.fetch(data[ModerationSchemaKeys.User])).find((log) => !(log[ModerationSchemaKeys.Type] & ModerationActions.Appealed));
		else throw new Error('Expected the entry id, case, or user. Got none of them.');

		if (!entry || entry[ModerationSchemaKeys.Guild] !== this.guild.id) throw new Error(ModerationErrors.CaseNotExists);
		if (entry[ModerationSchemaKeys.Type] & ModerationActions.Appealed) throw new Error(ModerationErrors.CaseAppealed);

		entry[ModerationSchemaKeys.Type] |= ModerationActions.Appealed;
		entry[ModerationSchemaKeys.Type] &= ~ModerationActions.Temporary;
		await this.table.get(entry.id).update(entry).run();

		return entry;
	}

	public createLock(): () => void {
		const lock = createReferPromise<undefined>();
		this._locks.push(lock);
		lock.promise.finally(() => { this._locks.splice(this._locks.indexOf(lock), 1); });

		return lock.resolve;
	}

	public releaseLock(): void {
		for (const lock of this._locks) lock.resolve();
	}

	public waitLock(): Promise<undefined[]> {
		return Promise.all(this._locks.map((lock) => lock.promise));
	}

	private _cache(entries: ModerationManagerInsertData | ModerationManagerEntry, type?: CacheActions): ModerationManagerEntry;
	private _cache(entries: (ModerationManagerInsertData | ModerationManagerEntry)[], type?: CacheActions): Collection<number, ModerationManagerEntry>;
	private _cache(
		entries: ModerationManagerEntry | ModerationManagerInsertData | (ModerationManagerEntry | ModerationManagerInsertData)[] | null,
		type: CacheActions = CacheActions.None): Collection<number, ModerationManagerEntry> | ModerationManagerEntry | null {
		if (!entries) return null;

		const parsedEntries = Array.isArray(entries)
			? entries.map((entry) => entry instanceof ModerationManagerEntry ? entry : new ModerationManagerEntry(this, entry))
			: [entries instanceof ModerationManagerEntry ? entries : new ModerationManagerEntry(this, entries)];

		for (const entry of parsedEntries)
			super.set(entry.case, entry);

		switch (type) {
			case CacheActions.Fetch: this._count = parsedEntries.length; break;
			case CacheActions.Insert: this._count++;
		}

		if (!this._timer) {
			this._timer = setInterval(() => {
				super.sweep((value) => value.cacheExpired);
				if (!super.size) this._timer = null;
			}, 1000);
		}

		return Array.isArray(entries)
			// @ts-ignore
			? new Collection<number, ModerationManagerEntry>(parsedEntries.map((entry) => [entry.case, entry]))
			: parsedEntries;
	}

	public static get [Symbol.species](): typeof Collection {
		return Collection;
	}

}

enum CacheActions {
	None,
	Fetch,
	Insert
}

export interface ModerationManagerInsertData {
	[ModerationSchemaKeys.Duration]: number | null;
	[ModerationSchemaKeys.ExtraData]: any;
	[ModerationSchemaKeys.Moderator]: string | null;
	[ModerationSchemaKeys.Reason]: string | null;
	[ModerationSchemaKeys.Type]: ModerationManagerTypeResolvable;
	[ModerationSchemaKeys.User]: string | User | null;
}

export interface ModerationManagerUpdateData {
	id?: string;
	[ModerationSchemaKeys.Duration]?: number | null;
	[ModerationSchemaKeys.ExtraData]?: any;
	[ModerationSchemaKeys.Moderator]?: string | User | null;
	[ModerationSchemaKeys.Reason]?: string | null;
}

export type ModerationManagerTypeResolvable = ModerationTypeKeys | number;
