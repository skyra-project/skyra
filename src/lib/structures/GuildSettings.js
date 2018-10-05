const { Settings } = require('klasa');

/**
 * The GuildSettings class that manages per-guild settings
 * @since 1.6.0
 * @version 8.0.0
 * @extends {Settings}
 */
// @ts-ignore
class GuildSettings extends Settings {

	_patch(...args) {
		// @ts-ignore
		super._patch(...args);
		this.updateFilter();
	}

	updateFilter() {
		// @ts-ignore
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
