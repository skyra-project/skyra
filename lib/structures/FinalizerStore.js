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
    }

    delete(name) {
        const finalizer = this.resolve(name);
        if (!finalizer) return false;
        super.delete(finalizer.name);
        return true;
    }

    run(...args) {
        for (const finalizer of this.values()) if (finalizer.enabled) finalizer.run(...args);
    }

    set(finalizer) {
        if (!(finalizer instanceof this.holds)) return this.client.emit('log', `Only ${this.holds.constructor.name}s may be stored in the Store.`, 'error');
        const existing = this.get(finalizer.name);
        if (existing) this.delete(existing);
        super.set(finalizer.name, finalizer);
        return finalizer;
    }

}

Store.applyToClass(FinalizerStore);

module.exports = FinalizerStore;
