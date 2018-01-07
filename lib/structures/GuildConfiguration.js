const { Configuration } = require('klasa');
const { Collection } = require('discord.js');

module.exports = class GuildConfiguration extends Configuration {

	constructor(manager, data) {
		super(manager, data);

		this.tags = new Collection('_tags' in data ? data._tags : undefined);
	}

	/**
	 * Get the prefix for this instance
	 * @since 3.0.0
	 * @readonly
	 */
	get prefix() {
		return this.master.prefix;
	}

	/**
	 * Get the advanced filter regexp
	 * @since 2.0.0
	 * @readonly
	 */
	get filterRegExp() {
		if (this.filter.regexp === null) this.updateFilter();
		return this.filter.regexp;
	}

	/**
	 * Update the tags
	 * @since 2.0.0
	 * @returns {Promise<this>}
	 */
	async sync() {
		await super.sync();
		if (this.existsInDB) {
			this.tags.clear();
			for (const [name, content] of this._tags) this.tags.set(name, content);
		}

		return this;
	}

	/**
	 * Update the regexp filter
	 * @since 2.0.0
	 */
	updateFilter() {
		this.filter.regexp = GuildConfiguration.superRegExp(this.filter.raw);
	}

	/**
	 * Build a super RegExp from an array
	 * @since 2.0.0
	 * @param {string[]} filterArray The array to process
	 * @returns {RegExp}
	 */
	static superRegExp(filterArray) {
		const filtered = filterArray.reduce((acum, item, index) => acum + (index ? '|' : '')
			+ item.replace(/\w(?=(\w)?)/g, (letter, nextWord) => `${letter}+${nextWord ? '\\W*' : ''}`), '');
		return new RegExp(`\\b(?:${filtered})\\b`, 'i');
	}

};
