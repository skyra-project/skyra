const { join } = require('path');
const { Collection } = require('discord.js');
const Monitor = require('./Monitor');
const Store = require('./interfaces/Store');

class MonitorStore extends Collection {

    constructor(client) {
        super();
        Object.defineProperty(this, 'client', { value: client });

        this.baseDir = join(this.client.baseDir, 'monitors');
        this.holds = Monitor;
    }

    delete(name) {
        const piece = this.resolve(name);
        if (!piece) return false;
        super.delete(piece.name);
        return true;
    }

    run(msg, settings, i18n) {
        for (const monit of this.values()) {
            if (this.shouldRun(msg, monit)) monit.run(msg, settings, i18n);
        }
    }

    set(monitor) {
        if (!(monitor instanceof this.holds)) return this.client.emit('log', `Only ${this.holds.constructor.name}s may be stored in the Store.`, 'error');
        const existing = this.get(monitor.name);
        if (existing) this.delete(existing);
        super.set(monitor.name, monitor);
        return monitor;
    }

    shouldRun(msg, monitor) {
        if (monitor.enabled !== true) return false;
        if (monitor.guildOnly && msg.channel.type !== 'text') return false;
        if (monitor.ignoreSelf && this.client.user === msg.author) return false;
        if (monitor.ignoreBots && msg.author.bot) return false;
        return true;
    }

}

Store.applyToClass(MonitorStore);

module.exports = MonitorStore;
