const { Collection } = require('discord.js');

const GuildSettings = require('../interfaces/GuildSettings');
const provider = require('../../providers/rethink');

class GuildManager extends Collection {

    constructor(client) {
        super();
        Object.defineProperty(this, 'client', { value: client });
    }

    get(id) {
        return super.get(id) || this.create(id);
    }

    set(id, object) {
        const guildSettings = new GuildSettings(this.client, id, object);
        super.set(id, guildSettings);
        return guildSettings;
    }

    async create(id) {
        this.client.emit('log', `GUILDS       | Created ${id}`, 'verbose');
        const guildSettings = new GuildSettings(this.client, id, {});
        await provider.create('guilds', { id });
        await provider.create('moderation', { id, cases: [] });
        guildSettings.setModeration([]);
        super.set(id, guildSettings);
        return guildSettings;
    }

    async delete(id) {
        this.client.emit('log', `GUILDS       | Deleted ${id}`, 'warn');
        await provider.delete('guilds', id);
        return super.delete(id);
    }

    all() {
        return this;
    }

}

module.exports = GuildManager;
