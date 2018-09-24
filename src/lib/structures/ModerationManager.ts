import { Collection } from 'discord.js';
import { R, RTable } from 'rethinkdb-ts';
import { SkyraGuild } from '../types/klasa';
import { ModerationLogData } from '../types/skyra';
import { MODERATION } from '../util/constants';
import ModerationManagerEntry from './ModerationManagerEntry';
const { SCHEMA_KEYS, ERRORS } = MODERATION;
const TABLENAME: string = 'moderation';

export default class ModerationManager extends Collection<number, ModerationManagerEntry> {

	public static get [Symbol.species](): typeof Collection {
		return Collection;
	}

	public get new(): ModerationManagerEntry {
		return new ModerationManagerEntry(this, <ModerationLogData> {});
	}

	public get pool(): R {
		return this.guild.client.providers.default.db;
	}

	public get table(): RTable {
		return this.guild.client.providers.default.db.table(TABLENAME);
	}

	public constructor(guild: SkyraGuild) {
		super();
		this.guild = guild;
	}

	public guild: SkyraGuild;
	private _count: number | null = null;
	private _timer: NodeJS.Timer | null = null;

	public async appeal(data: ModerationLogData): Promise<ModerationManagerEntry> {
		if (data[SCHEMA_KEYS.GUILD] !== this.guild.id) throw new Error(ERRORS.CASE_NOT_EXISTS);

		let entry: ModerationManagerEntry;
		if ('id' in data) entry = await this.table.get(data.id).default(null).run();
		else if (SCHEMA_KEYS.CASE in data) entry = await this.fetch(data[SCHEMA_KEYS.CASE]);
		else if (SCHEMA_KEYS.USER in data) entry = (await this.fetch(data.userID)).find((log) => !(log.appealed));
		else throw new Error('Expected the entry id, case, or user. Got none of them.');

		if (!entry) throw new Error(ERRORS.CASE_NOT_EXISTS);
		return entry.appeal();
	}

	public async count(): Promise<number> {
		if (this._count === null) await this.fetch();
		return <number> this._count;
	}

	public async fetch(): Promise<this>;
	public async fetch(id: number): Promise<ModerationManagerEntry>;
	public async fetch(id: string | Array<number>): Promise<Collection<number, ModerationManagerEntry>>;
	public async fetch(id?: number | string | Array<number>): Promise<Collection<number, ModerationManagerEntry> | ModerationManagerEntry | this> {
		// Case number
		if (typeof id === 'number') {
			// @ts-ignore
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
				// @ts-ignore
				: this._cache((await this.table.getAll([this.guild.id, id], { index: 'guild_user' })
					.orderBy(this.pool.asc(SCHEMA_KEYS.CASE))
					.run()));
		}

		if (Array.isArray(id) && id.length) {
			// @ts-ignore
			return this._cache(await this.table.getAll(...id.map((entryID) => [this.guild.id, entryID]), { index: 'guild_case' })
				.run());
		}

		if (super.size !== this._count) {
			this._cache(await this.table.getAll(this.guild.id, { index: 'guildID' })
				.orderBy(this.pool.asc(SCHEMA_KEYS.CASE))
				.run(), 'fetch');
		}
		return this;
	}

	public insert(data: ModerationLogData | ModerationManagerEntry): ModerationManagerEntry {
		return this._cache(data, 'insert');
	}

	public async update(data: ModerationLogData): Promise<void> {
		// @ts-ignore
		if (!data.id && SCHEMA_KEYS.CASE in data) data.id = (await this.fetch(data[SCHEMA_KEYS.CASE]) || { id: null }).id;
		if (!data.id) throw new Error('A id has not been specified and cannot be found.');
		await this.table.get(data.id).update(data).run();
	}

	private _cache(entries: null): null;
	private _cache(entries: Array<ModerationLogData | ModerationManagerEntry>, type: 'fetch'): Collection<number, ModerationManagerEntry>;
	private _cache(entries: ModerationLogData | ModerationManagerEntry, type: 'insert'): ModerationManagerEntry;
	private _cache(entries: ModerationLogData | ModerationManagerEntry | Array<ModerationLogData | ModerationManagerEntry> | null, type: 'none' | 'fetch' | 'insert' = 'none')
		: ModerationManagerEntry | Collection<number, ModerationManagerEntry> | null {
		if (entries === null) return null;

		if (!this._timer) {
			this._timer = setInterval(() => {
				super.sweep((value) => value.cacheExpired);
				if (!super.size) this._timer = null;
			}, 1000);
		}

		if (Array.isArray(entries)) {
			const collection: Collection<number, ModerationManagerEntry> = new Collection();
			for (const entry of entries) {
				const parsed: ModerationManagerEntry = entry instanceof ModerationManagerEntry ? entry : new ModerationManagerEntry(this, entry);
				super.set(<number> parsed.case, parsed);
				collection.set(<number> parsed.case, parsed);

				if (type === 'fetch') this._count = collection.size;

			}

			return collection;
		} else {
			const parsed: ModerationManagerEntry = entries instanceof ModerationManagerEntry ? entries : new ModerationManagerEntry(this, entries);
			super.set(<number> parsed.case, parsed);

			if (type === 'insert' && this._count !== null) this._count++;

			return parsed;
		}
	}

}
