/* eslint "no-bitwise": "off" */
import { Collection, Guild } from 'discord.js';
import { R, RTable } from 'rethinkdb-ts';
import { MODERATION } from '../util/constants';
import { createReferPromise, ReferredPromise } from '../util/util';
import { ModerationManagerEntry } from './ModerationManagerEntry';

const TABLENAME = 'moderation';
const { SCHEMA_KEYS, ACTIONS, ERRORS } = MODERATION;

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

	public async fetch(id: string[]): Promise<ModerationManagerEntry[]>;
	public async fetch(id?: []): Promise<this>;
	public async fetch(id: string | number): Promise<ModerationManagerEntry>;
	public async fetch(id?: string | number | string[]): Promise<ModerationManagerEntry | ModerationManagerEntry[] | Collection<number, ModerationManagerEntry> | this> {
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
					.orderBy(this.pool.asc(SCHEMA_KEYS.CASE))
					.run()) as ModerationManagerInsertData[], CacheActions.None);
		}

		if (Array.isArray(id) && id.length) {
			// @ts-ignore
			return this._cache(await this.table.getAll(...id.map((entryID) => [this.guild.id, entryID]), { index: 'guild_case' })
				.run());
		}

		if (super.size !== this._count) {
			this._cache(await this.table.getAll(this.guild.id, { index: 'guildID' })
				.orderBy(this.pool.asc(SCHEMA_KEYS.CASE))
				.run(), CacheActions.Fetch);
		}
		return this;
	}

	public async count(): Promise<number> {
		if (this._count === null) await this.fetch();
		return this._count;
	}

	public async update(data: ModerationManagerUpdateData | ModerationManagerEntry): Promise<void> {
		if (!data.id && SCHEMA_KEYS.CASE in data) data.id = (await this.fetch(data[SCHEMA_KEYS.CASE] as number) || { id: null }).id;
		if (!data.id) throw new Error('A id has not been specified and cannot be found.');
		await this.table.get(data.id).update(data).run();
	}

	public insert(data: ModerationManagerInsertData | ModerationManagerEntry): ModerationManagerEntry {
		return this._cache(data, CacheActions.Insert);
	}

	public async appeal(data: ModerationManagerUpdateData | ModerationManagerEntry): Promise<ModerationManagerEntry> {
		let entry;
		if ('id' in data) entry = await this.table.get(data.id).default(null).run();
		else if (SCHEMA_KEYS.CASE in data) entry = await this.fetch(data[SCHEMA_KEYS.CASE]);
		else if (SCHEMA_KEYS.USER in data) entry = (await this.fetch(data[SCHEMA_KEYS.USER])).find((log) => !(log[SCHEMA_KEYS.TYPE] & ACTIONS.APPEALED));
		else throw new Error('Expected the entry id, case, or user. Got none of them.');

		if (!entry || entry[SCHEMA_KEYS.GUILD] !== this.guild.id) throw new Error(ERRORS.CASE_NOT_EXISTS);
		if (entry[SCHEMA_KEYS.TYPE] & ACTIONS.APPEALED) throw new Error(ERRORS.CASE_APPEALED);

		entry[SCHEMA_KEYS.TYPE] |= ACTIONS.APPEALED;
		entry[SCHEMA_KEYS.TYPE] &= ~ACTIONS.TEMPORARY;
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

export interface ModerationLogCacheEntryData {
	CASE: 'caseID';
	DURATION: 'duration';
	EXTRA_DATA: 'extraData';
	GUILD: 'guildID';
	MODERATOR: 'moderatorID';
	REASON: 'reason';
	TYPE: 'type';
	USER: 'userID';
	CREATED_AT: 'createdAt';
}

declare const ModerationSchemaKeysConstant: ModerationLogCacheEntryData;

export interface ModerationManagerInsertData {
	[ModerationSchemaKeysConstant.DURATION]: number | null;
	[ModerationSchemaKeysConstant.EXTRA_DATA]: any;
	[ModerationSchemaKeysConstant.MODERATOR]: string | null;
	[ModerationSchemaKeysConstant.REASON]: string | null;
	[ModerationSchemaKeysConstant.TYPE]: ModerationManagerTypeResolvable;
	[ModerationSchemaKeysConstant.USER]: string | null;
}

export interface ModerationManagerUpdateData {
	id?: string;
	[ModerationSchemaKeysConstant.DURATION]?: number | null;
	[ModerationSchemaKeysConstant.EXTRA_DATA]?: any;
	[ModerationSchemaKeysConstant.MODERATOR]?: string | null;
	[ModerationSchemaKeysConstant.REASON]?: string | null;
}

export type ModerationManagerTypeResolvable = ModerationTypesEnum | number;

export type ModerationTypesEnum =
	// BAN
	0b0000 |
	// KICK
	0b0001 |
	// MUTE
	0b0010 |
	// PRUNE
	0b0011 |
	// SOFT_BAN
	0b0100 |
	// VOICE_KICK
	0b0101 |
	// VOICE_MUTE
	0b0110 |
	// WARN
	0b0111 |
	// BAN & APPEALED
	0b010000 |
	// MUTE & APPEALED
	0b010010 |
	// VOICE_MUTE & APPEALED
	0b010101 |
	// WARN & APPEALED
	0b010111 |
	// BAN & TEMPORARY
	0b100000 |
	// MUTE & TEMPORARY
	0b100010 |
	// VOICE_MUTE & TEMPORARY
	0b100110;
