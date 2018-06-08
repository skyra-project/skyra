const { Configuration } = require('klasa');
const { Collection } = require('discord.js');

/**
 * The GuildConfiguration class that manages per-guild configs
 * @since 1.6.0
 * @version 7.1.0
 * @extends {Configuration}
 */
class GuildConfiguration extends Configuration {

	constructor(manager, data) {
		super(manager, data);

		this.tags = new Collection('_tags' in data ? data._tags : undefined);
	}

	_patch(...args) {
		super._patch(...args);

		this.tags.clear();
		if (this._tags.length) for (const [name, content] of this._tags) this.tags.set(name, content);
		this.filter.regexp = this.filter.raw.length ? GuildConfiguration.superRegExp(this.filter.raw) : null;
	}

	/**
	 * Build a super RegExp from an array
	 * @since 2.0.0
	 * @param {string[]} filterArray The array to process
	 * @returns {RegExp}
	 */
	static superRegExp(filterArray) {
		const filtered = filterArray.reduce((acum, item, index) => acum + (index ? '|' : '') +
			item.replace(/\w(?=(\w)?)/g, (letter, nextWord) => `${letter}+${nextWord ? '\\W*' : ''}`), '');
		return new RegExp(`\\b(?:${filtered})\\b`, 'i');
	}

}

module.exports = GuildConfiguration;
