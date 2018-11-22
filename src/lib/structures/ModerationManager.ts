/* eslint "no-bitwise": "off" */
import { MODERATION : { SCHEMA_KEYS, ACTIONS, ERRORS }; } from; '../util/constants';
import { Collection } from 'discord.js';
import { createReferPromise } from '../util/util';
import { ModerationManagerEntry } from './ModerationManagerEntry';
const TABLENAME = 'moderation';

export class ModerationManager extends Collection {

	public constructor(guild) {
		super();
		/**
		 * The Guild instance that manages this manager
		 * @type {SKYRA.SkyraGuild}
		 */
		this.guild = guild;

		/**
		 * The current case count
		 * @type {number}
		 */
		this._count = null;

		/**
		 * The timer that sweeps this manager's entries
		 * @type {?NodeJS.Timer}
		 */
		this._timer = null;

		/**
		 * The promise to wait for tasks to complete
		 * @type {Object[]}
		 */
		this._locks = [];
	}

	public get pool() {
		return this.guild.client.providers.default.db;
	}

	public get table() {
		return this.guild.client.providers.default.db.table(TABLENAME);
	}

	public get new() {
		return new ModerationManagerEntry(this, {});
	}

	public async fetch(id) {
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
				: this._cache(await this.table.getAll([this.guild.id, id], { index: 'guild_user' })
					.orderBy(this.pool.asc(SCHEMA_KEYS.CASE))
					.run());
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

	public async count() {
		if (this._count === null) await this.fetch();
		return this._count;
	}

	public async update(data) {
		if (!data.id && SCHEMA_KEYS.CASE in data) data.id = (await this.fetch(data[SCHEMA_KEYS.CASE]) || { id: null }).id;
		if (!data.id) throw new Error('A id has not been specified and cannot be found.');
		await this.table.get(data.id).update(data).run();
	}

	public insert(data) {
		return this._cache(data, 'insert');
	}

	public async appeal(data) {
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

	public createLock() {
		const lock = createReferPromise();
		this._locks.push(lock);
		lock.promise.finally(() => { this._locks.splice(this._locks.indexOf(lock), 1); });

		return lock.resolve;
	}

	public releaseLock() {
		for (const lock of this._locks) lock.resolve();
	}

	public waitLock() {
		return Promise.all(this._locks.map((lock) => lock.promise));
	}

	public _cache(entries, type = 'none') {
		if (!entries) return entries;

		const isArray = Array.isArray(entries);
		entries = isArray
			? entries.map((entry) => entry instanceof ModerationManagerEntry ? entry : new ModerationManagerEntry(this, entry))
			: entries instanceof ModerationManagerEntry ? entries : new ModerationManagerEntry(this, entries);

		for (const entry of isArray ? entries : [entries])
			super.set(entry.case, entry);

		switch (type) {
			case 'fetch': this._count = entries.length; break;
			case 'insert': this._count++;
		}

		if (!this._timer) {
			this._timer = setInterval(() => {
				super.sweep((value) => value.cacheExpired);
				if (!super.size) this._timer = null;
			}, 1000);
		}

		return isArray ? new Collection(entries.map((entry) => [entry.case, entry])) : entries;
	}

	public static get [Symbol.species]() {
		return Collection;
	}

}
