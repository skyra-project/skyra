const { join } = require('path');
const { Collection } = require('discord.js');
const Language = require('./Language');
const Store = require('./interfaces/Store');

class LanguageStore extends Collection {

	constructor(client) {
		super();
		Object.defineProperty(this, 'client', { value: client });

		this.baseDir = join(this.client.baseDir, 'languages');
		this.holds = Language;

		/**
		 * The name of what this holds
		 * @type {String}
		 */
		this.name = 'languages';
	}

	/**
	 * The default language
	 * @readonly
	 * @return {Language} The default language set in SkyraClient.config
	 */
	get default() {
		return this.get(this.client.config.language);
	}

	/**
	 * Deletes a language from the store
	 * @param  {Finalizer|string} name The language object or a string representing the structure this store caches
	 * @return {boolean} whether or not the delete was successful.
	 */
	delete(name) {
		const finalizer = this.resolve(name);
		if (!finalizer) return false;
		super.delete(finalizer.name);
		return true;
	}

	/**
	 * Sets up a language in our store.
	 * @param {Language} language The language object we are setting up.
	 * @returns {Language}
	 */
	set(language) {
		if (!(language instanceof this.holds)) return this.client.emit('log', `Only ${this.name} may be stored in the Store.`, 'error');
		const existing = this.get(language.name);
		if (existing) this.delete(existing);
		super.set(language.name, language);
		return language;
	}

	/* eslint-disable no-empty-function */
	init() { }
	load() { }
	async loadAll() { }
	resolve() { }
	/* eslint-enable no-empty-function */

}

Store.applyToClass(LanguageStore);

module.exports = LanguageStore;
