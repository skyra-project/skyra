const { join } = require('path');
const Discord = require('discord.js');
const Extendable = require('./Extendable');
const Store = require('./interfaces/Store');

class ExtendableStore extends Discord.Collection {

	constructor(client) {
		super();
		Object.defineProperty(this, 'client', { value: client });

		this.baseDir = join(this.client.baseDir, 'extendables');
		this.holds = Extendable;

		/**
		 * The name of what this holds
		 * @type {String}
		 */
		this.name = 'extendables';
	}

	/**
	 * Deletes an extendable from the store.
	 * @param {Extendable|string} name A extendable object or a string representing a command or alias name.
	 * @returns {boolean} whether or not the delete was successful.
	 */
	delete(name) {
		const extendable = this.resolve(name);
		if (!extendable) return false;
		for (const structure of extendable.appliesTo) delete extendable.target[structure].prototype[this.name];
		super.delete(extendable.name);
		return true;
	}

	/**
	 * Clears the extendable from the store and removes the extensions.
	 * @return {void}
	 */
	clear() {
		for (const extendable of this.keys()) this.delete(extendable);
	}

	/**
	 * Sets up an extendable in our store.
	 * @param {Extendable} extendable The extendable object we are setting up.
	 * @returns {Extendable}
	 */
	set(extendable) {
		if (!(extendable instanceof Extendable)) return this.client.emit('log', `Only ${this.name} may be stored in the Store.`, 'error');
		extendable.init();
		super.set(extendable.name, extendable);
		return extendable;
	}

	/* eslint-disable no-empty-function */
	init() { }
	load() { }
	async loadAll() { }
	resolve() { }
	/* eslint-enable no-empty-function */

}

Store.applyToClass(ExtendableStore);

module.exports = ExtendableStore;
