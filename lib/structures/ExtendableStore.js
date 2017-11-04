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
	}

	delete(name) {
		const extendable = this.resolve(name);
		if (!extendable) return false;
		for (const structure of extendable.appliesTo) delete Discord[structure].prototype[this.name];
		super.delete(extendable.name);
		return true;
	}

	clear() {
		for (const extendable of this.keys()) this.delete(extendable);
	}

	set(extendable) {
		if (!(extendable instanceof Extendable)) return this.client.emit('log', 'Only extendables may be stored in the ExtendableStore.', 'error');
		extendable.init();
		super.set(extendable.name, extendable);
		return extendable;
	}

}

Store.applyToClass(ExtendableStore);

module.exports = ExtendableStore;
