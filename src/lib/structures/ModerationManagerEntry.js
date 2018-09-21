const { MODERATION: { TYPE_ASSETS, TYPE_KEYS, SCHEMA_KEYS, ACTIONS } } = require('../util/constants');
const { constants: { TIME }, Duration, Timestamp } = require('klasa');
const kTimeout = Symbol('ModerationManagerTimeout');

const TEMPORARY_TYPES = [TYPE_KEYS.BAN, TYPE_KEYS.MUTE, TYPE_KEYS.VOICE_MUTE];

class ModerationManagerEntry {

	constructor(manager, data = {}) {
		this.manager = manager;
		this.id = 'id' in data ? data.id : null;
		this.case = SCHEMA_KEYS.CASE in data ? data[SCHEMA_KEYS.CASE] : null;
		this.duration = SCHEMA_KEYS.DURATION in data ? data[SCHEMA_KEYS.DURATION] : null;
		this.extraData = SCHEMA_KEYS.EXTRA_DATA in data ? data[SCHEMA_KEYS.EXTRA_DATA] : null;
		this.guild = SCHEMA_KEYS.GUILD in data ? data[SCHEMA_KEYS.GUILD] : null;
		this.moderator = SCHEMA_KEYS.MODERATOR in data ? data[SCHEMA_KEYS.MODERATOR] : null;
		this.reason = SCHEMA_KEYS.REASON in data ? data[SCHEMA_KEYS.REASON] : null;
		this.type = SCHEMA_KEYS.TYPE in data ? data[SCHEMA_KEYS.TYPE] : null;
		this.user = SCHEMA_KEYS.USER in data ? data[SCHEMA_KEYS.USER] : null;
		this.createdAt = SCHEMA_KEYS.CREATED_AT in data ? data[SCHEMA_KEYS.CREATED_AT] : null;
		this[kTimeout] = Date.now() + (TIME.MINUTE * 15);
	}

	get name() {
		return TYPE_ASSETS[this.type].title;
	}

	get appealed() {
		// eslint-disable-next-line no-bitwise
		return Boolean(this.type | ACTIONS.APPEALED);
	}

	get temporary() {
		// eslint-disable-next-line no-bitwise
		return Boolean(this.type | ACTIONS.TEMPORARY);
	}

	get cacheExpired() {
		return Date.now() > this[kTimeout];
	}

	get cacheRemaining() {
		return Math.max(Date.now() - this[kTimeout], 0);
	}

	get shouldSend() {
		// If the moderation log is not anonymous, it should always send
		if (this.moderator) return true;

		const now = Date.now();
		const entries = this.manager.filter(entry => entry.user === this.user && entry.createdAt - now < TIME.MINUTE);

		// If there is no moderation log for this user that has not received a report, it should send
		if (!entries.size) return true;

		// If there was a log with the same type in the last minute, do not duplicate
		if (entries.some(entry => entry.type === this.type)) return false;

		// If this log is a ban or an unban, but the user was softbanned recently, abort
		if ((this.type === TYPE_KEYS.BAN || this.type === TYPE_KEYS.UN_BAN) && entries.some(entry => entry.type === TYPE_KEYS.SOFT_BAN)) return false;

		// For all other cases, it should send
		return true;
	}

	setCase(value) {
		this.case = value;
		return this;
	}

	setDuration(value) {
		if (typeof value === 'number') this.duration = value;
		else if (typeof value === 'string') this.duration = new Duration(value.trim()).offset;
		if (!this.duration || this.duration > TIME.DAY * 365) this.duration = null;
		return this;
	}

	setExtraData(value) {
		this.extraData = value;
		return this;
	}

	setGuild(value) {
		this.guild = value;
		return this;
	}

	setModerator(value) {
		this.moderator = value;
		return this;
	}

	setReason(value) {
		if (!value) return this;
		value = (Array.isArray(value) ? value.join(' ') : value).trim();

		if (value && TEMPORARY_TYPES.includes(this.type)) {
			const match = ModerationManagerEntry.regexParse.exec(value);
			if (match) {
				this.setDuration(match[1]);
				value = value.slice(0, match.index);
			}
		}

		this.reason = value.length ? value : null;
		return this;
	}

	setType(value) {
		if (typeof value === 'string' && (value in TYPE_KEYS))
			value = TYPE_KEYS[value];

		else if (typeof value !== 'number')
			throw new TypeError(`${this} | The type ${value} is not valid.`);

		this.type = value;
		return this;
	}

	setUser(value) {
		this.user = value;
		return this;
	}

	async create() {
		// If the entry was created, there is no point on re-sending
		if (this.createdAt) return null;
		this.createdAt = Date.now();

		// If the entry should not send, abort creation
		if (!this.shouldSend) return null;

		this.case = await this.manager.count() + 1;
		[this.id] = (await this.manager.table.insert(this.toJSON()).run()).generated_keys;
		this.manager.insert(this);

		// eslint-disable-next-line no-bitwise
		if (this.duration && (this.type | ACTIONS.APPEALED) in TYPE_ASSETS) {
			// eslint-disable-next-line no-bitwise
			await this.manager.guild.client.schedule.create(TYPE_ASSETS[this.type | ACTIONS.APPEALED].title.replace(/ /g, ''), this.duration + Date.now(), {
				catchUp: true,
				data: {
					[SCHEMA_KEYS.USER]: this.user,
					[SCHEMA_KEYS.GUILD]: this.guild,
					[SCHEMA_KEYS.DURATION]: this.duration,
					[SCHEMA_KEYS.CASE]: this.case
				}
			});
		}

		return this;
	}

	toJSON() {
		return {
			id: this.id,
			[SCHEMA_KEYS.CASE]: this.case,
			[SCHEMA_KEYS.DURATION]: this.duration,
			[SCHEMA_KEYS.EXTRA_DATA]: this.extraData,
			[SCHEMA_KEYS.GUILD]: this.guild,
			[SCHEMA_KEYS.MODERATOR]: this.moderator,
			[SCHEMA_KEYS.REASON]: this.reason,
			[SCHEMA_KEYS.TYPE]: this.type,
			[SCHEMA_KEYS.USER]: this.user,
			[SCHEMA_KEYS.CREATED_AT]: this.createdAt
		};
	}

	toString() {
		return `ModerationManagerEntry<${this.id}>`;
	}

}

ModerationManagerEntry.timestamp = new Timestamp('hh:mm:ss');
ModerationManagerEntry.regexParse = /,? *(?:for|time:?) ((?: ?(?:and|,)? ?\d{1,4} ?\w+)+)\.?$/i;

module.exports = ModerationManagerEntry;
