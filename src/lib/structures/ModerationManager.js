/* eslint "key-spacing": ["error", { "beforeColon": true, "align": "colon" }] */
/* eslint "no-bitwise": "off", "no-multi-spaces": "off" */
const { Collection } = require('discord.js');
const { constants: { TIME } } = require('klasa');
const kTimeout = Symbol('ModerationManagerTimeout');
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
			return super.get(id) || this._cache(await this.table.getAll([this.guild.id, id], { index : 'guild_case' })
				.limit(1)
				.nth(0)
				.default(null)
				.run());
		}

		// User id
		if (typeof id === 'string') {
			return this._count === super.size
				? super.filter(entry => entry[SCHEMA_KEYS.USER] === id)
				: this._cache(await this.table.getAll([this.guild.id, id], { index : 'guild_user' })
					.orderBy(this.pool.asc(SCHEMA_KEYS.CASE))
					.run());
		}

		if (Array.isArray(id) && id.length) {
			return this._cache(await this.table.getAll(...id.map(entryID => [this.guild.id, entryID]), { index : 'guild_case' })
				.run());
		}

		if (super.size !== this._count) {
			this._cache(await this.table.getAll(this.guild.id, { index : 'guildID' })
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
		if (!data.id && SCHEMA_KEYS.CASE in data) data.id = (await this.fetch(data[SCHEMA_KEYS.CASE]) || { id : null }).id;
		if (!data.id) throw new Error('A id has not been specified and cannot be found.');
		await this.table.get(data.id).update(data).run();
	}

	async insert(data) {
		const entry = {
			id                  : undefined,
			...data,
			[SCHEMA_KEYS.GUILD] : this.guild.id,
			[SCHEMA_KEYS.CASE]  : await this.count()
		};

		[entry.id] = (await this.table.insert(entry).run()).generated_keys;
		return this._cache(entry, 'insert');
	}

	async appeal(data) {
		let entry;
		if ('id' in data) entry = await this.table.get(data.id).default(null).run();
		else if (SCHEMA_KEYS.CASE in data) entry = await this.fetch(data[SCHEMA_KEYS.CASE]);
		else if (SCHEMA_KEYS.USER in data) entry = (await this.fetch(data[SCHEMA_KEYS.USER])).find(log => !log[SCHEMA_KEYS.APPEAL]);
		else throw new Error('Expected the entry id, case, or user. Got none of them.');

		if (!entry || entry[SCHEMA_KEYS.GUILD] !== this.guild.id) throw new Error(ERRORS.CASE_NOT_EXISTS);
		if (entry[SCHEMA_KEYS.TYPE] & ACTION_APPEALED) throw new Error(ERRORS.CASE_APPEALED);

		entry[SCHEMA_KEYS.TYPE] |= ACTION_APPEALED;
		entry[SCHEMA_KEYS.TYPE] &= ~ACTION_TIMED;
		await this.table.get(entry.id).update(entry).run();

		return entry;
	}

	_cache(entries, type = 'none') {
		const timeout = Date.now() + TIME.HOUR;
		for (const entry of Array.isArray(entries) ? entries : [entries])
			super.set(entry[SCHEMA_KEYS.CASE], { ...entry, [kTimeout] : timeout });

		switch (type) {
			case 'fetch': this._count = entries.length; break;
			case 'insert': this._count++; break;
		}

		if (!this._timer) {
			this._timer = setInterval(() => {
				const now = Date.now();
				super.sweep(value => value[kTimeout] < now);
				if (!super.size) this._timer = null;
			}, 1000);
		}

		return entries;
	}

}

const SCHEMA_KEYS = {
	CASE       : 'caseID',
	DURATION   : 'duration',
	EXTRA_DATA : 'extraData',
	GUILD      : 'guildID',
	MODERATOR  : 'moderatorID',
	REASON     : 'reason',
	TYPE       : 'type',
	USER       : 'userID'
};

const TYPE_KEYS = {
	BAN                  : 0x0000,
	KICK                 : 0x0001,
	MUTE                 : 0x0010,
	PRUNE                : 0x0011,
	SOFT_BAN             : 0x0100,
	VOICE_KICK           : 0x0101,
	VOICE_MUTE           : 0x0110,
	WARN                 : 0x0111,
	UN_BAN               : null,
	UN_MUTE              : null,
	UN_VOICE_MUTE        : null,
	UN_WARN              : null,
	TEMPORARY_BAN        : null,
	TEMPORARY_MUTE       : null,
	TEMPORARY_VOICE_MUTE : null
};

const ACTION_UNDO    = 1 << 4,
	ACTION_TEMPORARY = 1 << 5,
	ACTION_TIMED     = 1 << 6,
	ACTION_APPEALED  = 1 << 7;

TYPE_KEYS.UN_BAN               = TYPE_KEYS.BAN        | ACTION_UNDO;
TYPE_KEYS.UN_MUTE              = TYPE_KEYS.MUTE       | ACTION_UNDO;
TYPE_KEYS.UN_VOICE_MUTE        = TYPE_KEYS.VOICE_MUTE | ACTION_UNDO;
TYPE_KEYS.UN_WARN              = TYPE_KEYS.WARN       | ACTION_UNDO;
TYPE_KEYS.TEMPORARY_BAN        = TYPE_KEYS.BAN        | ACTION_TEMPORARY;
TYPE_KEYS.TEMPORARY_MUTE       = TYPE_KEYS.MUTE       | ACTION_TEMPORARY;
TYPE_KEYS.TEMPORARY_VOICE_MUTE = TYPE_KEYS.VOICE_MUTE | ACTION_TEMPORARY;

const ACTIONS = {
	UNDO      : ACTION_UNDO,
	TEMPORARY : ACTION_TEMPORARY,
	TIMED     : ACTION_TIMED,
	APPEALED  : ACTION_APPEALED
};

const ERRORS = {
	CASE_APPEALED        : 'CASE_APPEALED',
	CASE_NOT_EXISTS      : 'CASE_NOT_EXISTS',
	CASE_TYPE_NOT_APPEAL : 'CASE_TYPE_NOT_APPEAL'
};

ModerationManager.SCHEMA_KEYS = Object.freeze(SCHEMA_KEYS);
ModerationManager.TYPE_KEYS = Object.freeze(TYPE_KEYS);
ModerationManager.ACTIONS = Object.freeze(ACTIONS);
ModerationManager.ERRORS = Object.freeze(ERRORS);

module.exports = ModerationManager;
