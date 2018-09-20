const { MODERATION: { TYPE_ASSETS, SCHEMA_KEYS, ACTIONS } } = require('../util/constants');
const { constants: { TIME } } = require('klasa');
const kTimeout = Symbol('ModerationManagerTimeout');

class ModerationManagerEntry {

	constructor(data) {
		this.id = data;
		this.case = data[SCHEMA_KEYS.CASE];
		this.duration = data[SCHEMA_KEYS.DURATION];
		this.extraData = data[SCHEMA_KEYS.EXTRA_DATA];
		this.guild = data[SCHEMA_KEYS.GUILD];
		this.moderator = data[SCHEMA_KEYS.MODERATOR];
		this.reason = data[SCHEMA_KEYS.REASON];
		this.type = data[SCHEMA_KEYS.TYPE];
		this.user = data[SCHEMA_KEYS.USER];
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
			[SCHEMA_KEYS.USER]: this.user
		};
	}

	toString() {
		return `ModerationManagerEntry<${this.id}>`;
	}

}

module.exports = ModerationManagerEntry;
