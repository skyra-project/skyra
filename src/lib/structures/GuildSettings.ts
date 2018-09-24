import { Collection } from 'discord.js';
import { Settings } from 'klasa';

/**
 * The GuildSettings class that manages per-guild settings
 * @since 1.6.0
 * @version 7.1.0
 */
// @ts-ignore
export default class GuildSettings extends Settings {
	public filter: { raw: Array<string>; regexp: RegExp | null };
	public tags: Collection<string, string>;
	private _tags: Array<[string, string]>;

	public updateFilter() {
		this.filter.regexp = this.filter.raw.length ? GuildSettings.superRegExp(this.filter.raw) : null;
	}

	private _patch(...args) {
		// @ts-ignore
		super._patch(...args);

		this.tags = new Collection();
		for (const [name, content] of this._tags) this.tags.set(name, content);
		this.updateFilter();
	}

	/**
	 * Build a super RegExp from an array
	 * @since 2.0.0
	 */
	private static superRegExp(filterArray: Array<string>): RegExp {
		const filtered = filterArray.reduce((acum, item, index) => acum + (index ? '|' : '') +
			item.replace(/\w(?=(\w)?)/g, (letter, nextWord) => `${letter}+${nextWord ? '\\W*' : ''}`), '');
		return new RegExp(`\\b(?:${filtered})\\b`, 'gi');
	}

}

module.exports = GuildSettings;
