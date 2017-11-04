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
	}


	get default() {
		return this.get(this.client.config.language);
	}

	delete(name) {
		const finalizer = this.resolve(name);
		if (!finalizer) return false;
		super.delete(finalizer.name);
		return true;
	}

	set(language) {
		if (!(language instanceof this.holds)) return this.client.emit('log', `Only ${this.holds.constructor.name}s may be stored in the Store.`, 'error');
		const existing = this.get(language.name);
		if (existing) this.delete(existing);
		super.set(language.name, language);
		return language;
	}

}

Store.applyToClass(LanguageStore);

module.exports = LanguageStore;
