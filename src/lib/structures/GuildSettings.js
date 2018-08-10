const { Settings } = require('klasa');
const { Collection } = require('discord.js');

/**
 * The GuildSettings class that manages per-guild settings
 * @since 1.6.0
 * @version 7.1.0
 * @extends {Settings}
 */
class GuildSettings extends Settings {

	_patch(...args) {
		super._patch(...args);

		this.tags = new Collection();
		for (const [name, content] of this._tags) this.tags.set(name, content);
		this.updateFilter();
	}

	updateFilter() {
		this.filter.regexp = this.filter.raw.length ? GuildSettings.superRegExp(this.filter.raw) : null;
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
		return new RegExp(`\\b(?:${filtered})\\b`, 'gi');
	}

}

module.exports = GuildSettings;
