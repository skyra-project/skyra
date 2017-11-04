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
	}

	clear() {
		for (const event of this.keys()) this.delete(event);
	}

	delete(name) {
		const event = this.resolve(name);
		if (!event) return false;
		this.client.removeAllListeners(event.name);
		super.delete(event.name);
		return true;
	}

	set(event) {
		if (!(event instanceof Event)) return this.client.emit('log', 'Only events may be stored in the EventStore.', 'error');
		const existing = this.get(event.name);
		if (existing) this.delete(existing);
		this.client.on(event.name, event._run.bind(event));
		super.set(event.name, event);
		return event;
	}

}

Store.applyToClass(EventStore);

module.exports = EventStore;
