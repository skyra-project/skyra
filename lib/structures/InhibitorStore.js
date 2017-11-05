const { join } = require('path');
const { Collection } = require('discord.js');
const Inhibitor = require('./Inhibitor');
const Store = require('./interfaces/Store');


class InhibitorStore extends Collection {


	constructor(client) {
		super();
		Object.defineProperty(this, 'client', { value: client });

		this.baseDir = join(this.client.baseDir, 'inhibitors');
		this.holds = Inhibitor;

		/**
		 * The name of what this holds
		 * @type {String}
		 */
		this.name = 'inhibitors';
	}

	/**
	 * Deletes a inhibitor from the store
	 * @param  {Inhibitor|string} name The inhibitor object or a string representing the structure this store caches
	 * @returns {boolean} whether or not the delete was successful.
	 */
	delete(name) {
		const inhibitor = this.resolve(name);
		if (!inhibitor) return false;
		super.delete(inhibitor.name);
		return true;
	}

	async run(msg, cmd, selective = false, settings, i18n) {
		const mps = [];
		for (const mProc of this.values()) if (!mProc.spamProtection || !selective) mps.push(mProc.run(msg, cmd, settings, i18n).catch(err => err));
		const results = (await Promise.all(mps)).filter(res => res);
		if (results.includes(true)) throw undefined;
		if (results.length > 0) throw results.join('\n');
		return undefined;
	}

	/**
	 * Sets up a inhibitor in our store.
	 * @param {Inhibitor} inhibitor The inhibitor object we are setting up.
	 * @returns {Inhibitor}
	 */
	set(inhibitor) {
		if (!(inhibitor instanceof this.holds)) return this.client.emit('log', `Only ${this.name} may be stored in the Store.`, 'error');
		const existing = this.get(inhibitor.name);
		if (existing) this.delete(existing);
		super.set(inhibitor.name, inhibitor);
		return inhibitor;
	}

	/* eslint-disable no-empty-function */
	init() { }
	load() { }
	async loadAll() { }
	resolve() { }
	/* eslint-enable no-empty-function */

}

Store.applyToClass(InhibitorStore);

module.exports = InhibitorStore;
