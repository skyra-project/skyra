/* eslint "no-bitwise": "off" */
const { MODERATION: { SCHEMA_KEYS, ACTIONS, ERRORS } } = require('../util/constants');
const ModerationManagerEntry = require('./ModerationManagerEntry');
const { Collection } = require('discord.js');
const TABLENAME = 'moderation';

class ModerationManager extends Collection {

	constructor(guild) {
		super();
		this.guild = guild;
		this._count = null;
		this._timer = null;
	}

	get pool() {
		return this.guild.client.providers.default.db;
	}

	get table() {
		return this.guild.client.providers.default.db.table(TABLENAME);
	}

	async fetch(id) {
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
				? super.filter(entry => entry[SCHEMA_KEYS.USER] === id)
				: this._cache(await this.table.getAll([this.guild.id, id], { index: 'guild_user' })
					.orderBy(this.pool.asc(SCHEMA_KEYS.CASE))
					.run());
		}

		if (Array.isArray(id) && id.length) {
			return this._cache(await this.table.getAll(...id.map(entryID => [this.guild.id, entryID]), { index: 'guild_case' })
				.run());
		}

		if (super.size !== this._count) {
			this._cache(await this.table.getAll(this.guild.id, { index: 'guildID' })
				.orderBy(this.pool.asc(SCHEMA_KEYS.CASE))
				.run(), 'fetch');
		}
		return this;
	}

	async count() {
		if (this._count === null) await this.fetch();
		return this._count;
	}

	async update(data) {
		if (!data.id && SCHEMA_KEYS.CASE in data) data.id = (await this.fetch(data[SCHEMA_KEYS.CASE]) || { id: null }).id;
		if (!data.id) throw new Error('A id has not been specified and cannot be found.');
		await this.table.get(data.id).update(data).run();
	}

	insert(data) {
		return this._cache(data, 'insert');
	}

	async appeal(data) {
		let entry;
		if ('id' in data) entry = await this.table.get(data.id).default(null).run();
		else if (SCHEMA_KEYS.CASE in data) entry = await this.fetch(data[SCHEMA_KEYS.CASE]);
		else if (SCHEMA_KEYS.USER in data) entry = (await this.fetch(data[SCHEMA_KEYS.USER])).find(log => !(log[SCHEMA_KEYS.TYPE] & ACTIONS.APPEALED));
		else throw new Error('Expected the entry id, case, or user. Got none of them.');

		if (!entry || entry[SCHEMA_KEYS.GUILD] !== this.guild.id) throw new Error(ERRORS.CASE_NOT_EXISTS);
		if (entry[SCHEMA_KEYS.TYPE] & ACTIONS.APPEALED) throw new Error(ERRORS.CASE_APPEALED);

		entry[SCHEMA_KEYS.TYPE] |= ACTIONS.APPEALED;
		entry[SCHEMA_KEYS.TYPE] &= ~ACTIONS.TEMPORARY;
		await this.table.get(entry.id).update(entry).run();

		return entry;
	}

	_cache(entries, type = 'none') {
		const isArray = Array.isArray(entries);
		entries = isArray ? entries.map(entry => new ModerationManagerEntry(entry)) : new ModerationManagerEntry(entries);

		for (const entry of isArray ? entries : [entries])
			super.set(entry.case, entry);

		switch (type) {
			case 'fetch': this._count = entries.length; break;
			case 'insert': this._count++; break;
		}

		if (!this._timer) {
			this._timer = setInterval(() => {
				const now = Date.now();
				super.sweep(value => value.cacheExpired < now);
				if (!super.size) this._timer = null;
			}, 1000);
		}

		return entries;
	}

}

module.exports = ModerationManager;
