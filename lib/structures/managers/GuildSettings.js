const RethinkDB = require('../../../providers/rethink');
const Moderation = require('./Moderation');
const { Collection } = require('discord.js');

const superRegExp = (filterArray) => {
	const filtered = filterArray.reduce((acum, item, index) => acum + (index ? '|' : '')
		+ item.replace(/\w(?=(\w)?)/g, (letter, nextWord) => `${letter}+${nextWord ? '\\W*' : ''}`), '');
	return new RegExp(`\\b(?:${filtered})\\b`, 'i');
};

/**
 * Global settings for guilds.
 * @class GuildSettings
 */
class GuildSettings {

	constructor(client, id, data = {}) {
		Object.defineProperty(this, 'client', { value: client });
		Object.defineProperty(this, 'id', { value: id });

		const schema = this.client.settings.guilds.schema;
		for (let i = 0; i < schema._keys.length; i++)
			this._merge(data, schema._keys[i], schema[schema._keys[i]]);

		this.social.boost = data.social.boost || 1;
		this.social.monitorBoost = data.social.monitorBoost || 1;

		this.filter.regexp = null;
		this.autoroles = data.autoroles || [];

		this.moderation = null;
		this.tags = new Collection(data.tags || []);
		this.init();
	}

	init() {
		if (this.autoroles.length > 0) this.autoroles = this.autoroles.sort((x, y) => +(x.points > y.points) || +(x.points === y.points) - 1);
		if (this.filter.raw.length > 0) this.updateFilter();
	}

	_merge(data, group, folder) {
		this[group] = {};

		if (typeof data[group] === 'undefined') data[group] = {};
		for (let i = 0; i < folder._keys.length; i++)
			this[group][folder._keys[i]] = typeof data[group][folder._keys[i]] !== 'undefined'
				? data[group][folder._keys[i]]
				: folder[folder._keys[i]].default;
	}

	setModeration(modlogs) {
		this.moderation = new Moderation(this.id, modlogs);
		return this.moderation;
	}

	async update(doc) {
		await RethinkDB.update('guilds', this.id, doc);
		return this.sync(doc);
	}

	async sync(doc) {
		if (typeof doc === 'undefined') doc = await RethinkDB.get('guilds', this.id);
		this._sync(doc, this, this.client.settings.guilds.schema);

		return this;
	}

	_sync(doc, cache, schema) {
		const keys = Object.keys(doc);
		for (let i = 0; i < keys.length; i++) {
			if (schema.has(keys[i]) === false) continue;
			if (schema[keys[i]].type === 'Folder') {
				cache = this._sync(doc[keys[i]], cache[keys[i]], schema[keys[i]]);
				continue;
			}
			cache[keys[i]] = doc[keys[i]];
		}

		return cache;
	}

	updateFilter() {
		this.filter.regexp = superRegExp(this.filter.raw);
	}

	get filterRegExp() {
		if (this.filter.regexp === null) this.filter.regexp = superRegExp(this.filter.raw);
		return this.filter.regexp;
	}

	toJSON() {
		return {
			master: this.master,
			disable: this.disable,
			roles: this.roles,
			events: this.events,
			channels: this.channels,
			messages: this.messages,
			selfmod: this.selfmod,
			social: this.social,
			autoroles: this.autoroles,
			filter: {
				level: this.filter.level,
				raw: this.filter.raw
			}
		};
	}

	static superRegExp(array) {
		return superRegExp(array);
	}

}

module.exports = GuildSettings;
