const { join } = require('path');
const { Collection } = require('discord.js');
const Event = require('./Event');
const Store = require('./interfaces/Store');

class EventStore extends Collection {

	constructor(client) {
		super();
		Object.defineProperty(this, 'client', { value: client });

		this.baseDir = join(this.client.baseDir, 'events');
		this.holds = Event;

		/**
		 * The name of what this holds
		 * @type {String}
		 */
		this.name = 'events';
	}

	/**
	 * Clears the events from the store and removes the listeners.
	 * @return {void}
	 */
	clear() {
		for (const event of this.keys()) this.delete(event);
	}

	/**
	 * Deletes an event from the store.
	 * @param  {Event|string} name An event object or a string representing the event name.
	 * @return {boolean} whether or not the delete was successful.
	 */
	delete(name) {
		const event = this.resolve(name);
		if (!event) return false;
		this.client.removeAllListeners(event.name);
		super.delete(event.name);
		return true;
	}

	/**
	 * Sets up an event in our store.
	 * @param {Event} event The event object we are setting up.
	 * @returns {Event}
	 */
	set(event) {
		if (!(event instanceof Event)) return this.client.emit('log', `Only ${this.name} may be stored in the Store.`, 'error');
		const existing = this.get(event.name);
		if (existing) this.delete(existing);
		this.client.on(event.name, event._run.bind(event));
		super.set(event.name, event);
		return event;
	}

	/* eslint-disable no-empty-function */
	init() { }
	load() { }
	async loadAll() { }
	resolve() { }
	/* eslint-enable no-empty-function */

}

Store.applyToClass(EventStore);

module.exports = EventStore;
