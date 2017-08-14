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
    }

    delete(name) {
        const inhibitor = this.resolve(name);
        if (!inhibitor) return false;
        super.delete(inhibitor.name);
        return true;
    }

    async run(msg, cmd, selective = false, settings) {
        const mps = [];
        for (const mProc of this.values()) if (!mProc.spamProtection || !selective) mps.push(mProc.run(msg, cmd, settings).catch(err => err));
        const results = (await Promise.all(mps)).filter(res => res);
        if (results.includes(true)) throw undefined;
        if (results.length > 0) throw results.join('\n');
        return undefined;
    }

    set(inhibitor) {
        if (!(inhibitor instanceof this.holds)) return this.client.emit('log', `Only ${this.holds.constructor.name}s may be stored in the Store.`, 'log');
        const existing = this.get(inhibitor.name);
        if (existing) this.delete(existing);
        super.set(inhibitor.name, inhibitor);
        return inhibitor;
    }

}

Store.applyToClass(InhibitorStore);

module.exports = InhibitorStore;
