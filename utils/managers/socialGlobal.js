const { Collection } = require('discord.js');

const GlobalUser = require('../interfaces/GlobalUser');
const provider = require('../../providers/rethink');

class SocialGlobalManager extends Collection {

    get(id) {
        return super.get(id) || this.addUser(id);
    }

    set(id, data) {
        const globalUser = new GlobalUser(id, data);
        super.set(id, globalUser);
        return globalUser;
    }

    all() {
        return this;
    }

    async addUser(id) {
        const globalUser = new GlobalUser(id, {});
        await provider.create('users', globalUser.toJSON());
        super.set(id, globalUser);
        return globalUser;
    }

    async delete(id) {
        await provider.delete('users', id);
        return super.delete(id);
    }

}

module.exports = SocialGlobalManager;
