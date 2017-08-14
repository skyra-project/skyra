const { Collection } = require('discord.js');

const GlobalUser = require('../interfaces/GlobalUser');
const provider = require('../../providers/rethink');
const { log } = require('../debugLog');

class SocialGlobalManager extends Collection {

    get(id) {
        return super.get(id) || this.addUser(id);
    }

    set(id, data) {
        const globalUser = new GlobalUser(id, data);
        super.set(id, globalUser);
        return globalUser;
    }

    sorted(property = 'points') {
        return this.sort((x, y) => +(x[property] < y[property]) || +(x[property] === y[property]) - 1);
    }

    all() {
        return this;
    }

    async addUser(id) {
        log(`GLOBALSCORES | Created ${id}`);
        const globalUser = new GlobalUser(id, {});
        await provider.create('users', { id });
        super.set(id, globalUser);
        return globalUser;
    }

    async delete(id) {
        log(`GLOBALSCORES | Deleted ${id}`);
        await provider.delete('users', id);
        return super.delete(id);
    }

}

module.exports = SocialGlobalManager;
