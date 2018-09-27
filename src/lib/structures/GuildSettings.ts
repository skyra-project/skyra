import { Collection } from 'discord.js';
import { Settings } from 'klasa';

/**
 * The GuildSettings class that manages per-guild settings
 * @since 1.6.0
 * @version 7.1.0
 */
// @ts-ignore
export default class GuildSettings extends Settings {
	public filter: { raw: Array<string>; regexp: RegExp | null } = {raw: [], regexp: null};
	public tags: Collection<string, string> = new Collection();
	private _tags: Array<[string, string]> = [];

	public updateFilter(): void {
		this.filter.regexp = this.filter.raw.length ? GuildSettings.superRegExp(this.filter.raw) : null;
	}

	// @ts-ignore
	private _patch(data: { [k: string]: any }, instance?: object, schema?: SchemaFolder): void {
		// @ts-ignore
		super._patch(data, instance, schema);

		this.tags = new Collection();
		for (const [name, content] of this._tags) this.tags.set(name, content);
		this.updateFilter();
	}

	/**
	 * Build a super RegExp from an array
	 * @since 2.0.0
	 */
	private static superRegExp(filterArray: Array<string>): RegExp {
		const filtered: string = filterArray.reduce((acum: string, item: string, index: number) => acum + (index ? '|' : '') +
			item.replace(/\w(?=(\w)?)/g, (letter: string, nextWord: string) => `${letter}+${nextWord ? '\\W*' : ''}`), '');
		return new RegExp(`\\b(?:${filtered})\\b`, 'gi');
	}

}

export default GuildSettings;
