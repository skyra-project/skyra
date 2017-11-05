const { join } = require('path');
const { Collection } = require('discord.js');
const Finalizer = require('./Finalizer');
const Store = require('./interfaces/Store');

class FinalizerStore extends Collection {

	constructor(client) {
		super();
		Object.defineProperty(this, 'client', { value: client });

		this.baseDir = join(this.client.baseDir, 'finalizers');
		this.holds = Finalizer;

		/**
		 * The name of what this holds
		 * @type {String}
		 */
		this.name = 'finalizers';
	}

	/**
	 * Deletes a finalizer from the store
	 * @param  {Finalizer|string} name The finalizer object or a string representing the structure this store caches
	 * @return {boolean} whether or not the delete was successful.
	 */
	delete(name) {
		const finalizer = this.resolve(name);
		if (!finalizer) return false;
		super.delete(finalizer.name);
		return true;
	}

	/**
	 * Runs all of our finalizers after a command is ran successfully.
	 * @param  {Array} args An array of arguments passed down from the command
	 * @return {void}
	 */
	run(...args) {
		for (const finalizer of this.values()) if (finalizer.enabled) finalizer.run(...args);
	}

	/**
	 * Sets up a finalizer in our store.
	 * @param {Finalizer} finalizer The finalizer object we are setting up.
	 * @returns {Finalizer}
	 */
	set(finalizer) {
		if (!(finalizer instanceof this.holds)) return this.client.emit('log', `Only ${this.name} may be stored in the Store.`, 'error');
		const existing = this.get(finalizer.name);
		if (existing) this.delete(existing);
		super.set(finalizer.name, finalizer);
		return finalizer;
	}

	/* eslint-disable no-empty-function */
	init() { }
	load() { }
	async loadAll() { }
	resolve() { }
	/* eslint-enable no-empty-function */

}

Store.applyToClass(FinalizerStore);

module.exports = FinalizerStore;
