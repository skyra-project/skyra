const { Collection } = require('discord.js');

const GuildSettings = require('../interfaces/GuildSettings');
const provider = require('../../providers/rethink');
const { log } = require('../debugLog');

class GuildManager extends Collection {

    get(id) {
        return super.get(id) || this.create(id);
    }

    set(id, object) {
        const guildSettings = new GuildSettings(id, object);
        super.set(id, guildSettings);
        return guildSettings;
    }

    async create(id) {
        log(`GUILDS       | Created ${id}`);
        const guildSettings = new GuildSettings(id, {});
        await provider.create('guilds', { id });
        await provider.create('moderation', { id, cases: [] });
        guildSettings.setModeration([]);
        super.set(id, guildSettings);
        return guildSettings;
    }

    async delete(id) {
        log(`GUILDS       | Deleted ${id}`);
        await provider.delete('guilds', id);
        return super.delete(id);
    }

    all() {
        return this;
    }

}

module.exports = GuildManager;
