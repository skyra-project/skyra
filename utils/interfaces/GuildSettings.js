const provider = require('../../providers/rethink');
const Moderation = require('../moderation');

const superRegExp = (filterArray) => {
    const filtered = filterArray.reduce((acum, item, index) => acum + (index ? '|' : '') +
        item.replace(/\w(?=(\w)?)/g, (letter, nextWord) => `${letter}+${nextWord ? '\\W*' : ''}`), '');
    return new RegExp(`\\b(?:${filtered})\\b`, 'i');
};

class GuildSettings {

    constructor(id, data = {}, moderation = []) { // eslint-disable-line complexity
        Object.defineProperty(this, 'id', { value: id });

        this.prefix = data.prefix || 's!';
        this.roles = data.roles || {};
        this.events = data.events || {};
        this.channels = data.channels || {};
        this.messages = data.messages || {};

        this.ignoreChannels = data.ignoreChannels || [];
        this.disabledCommands = data.disabledCommands || [];
        this.disabledCmdChannels = data.disabledCmdChannels || [];
        this.publicRoles = data.publicRoles || [];
        this.autoroles = data.autoroles || [];

        this.mode = data.mode || 0;
        this.initialRole = data.initialRole || null;

        if (!data.social) data.social = {};
        this.social = {
            boost: data.social.boost || 1,
            monitorBoost: data.social.monitorBoost || 1
        };

        if (!data.selfmod) data.selfmod = {};
        this.selfmod = {
            ghostmention: data.selfmod.ghostmention || false,
            inviteLinks: data.selfmoda.inviteLinks || false,
            nomentionspam: data.selfmod.nomentionspam || false,
            nmsthreshold: data.selfmod.nmsthreshold || 20
        };

        if (!data.filter) data.filter = {};
        this.filter = {
            level: data.filter.level || 0,
            raw: data.filter.raw || [],
            regexp: null
        };

        this.moderation = new Moderation(this.id, moderation);
    }

    async update(doc) {
        await provider.update('guilds', this.id, doc);
        for (const [key, value] of Object.entries(doc)) {
            if (value instanceof Object) {
                for (const [subkey, subvalue] of Object.entries(value)) this[key][subkey] = subvalue;
            } else {
                this[key] = value;
            }
        }
        return this;
    }

    set filterRegExp(value) {
        this.filter.regexp = superRegExp(this.filter.raw);
        return this.filter.regexp;
    }

    get filterRegExp() {
        if (this.filter.regexp === null) this.filter.regexp = superRegExp(this.filter.raw);
        return this.filter.regexp;
    }

    toJSON() {
        return {
            prefix: this.prefix,
            roles: this.roles,
            events: this.events,
            channels: this.channels,
            messages: this.messages,
            ignoreChannels: this.ignoreChannels,
            disabledCommands: this.disabledCommands,
            disabledCmdChannels: this.disabledCmdChannels,
            publicRoles: this.publicRoles,
            autoroles: this.autoroles,
            mode: this.mode,
            initialRole: this.initialRole,
            social: this.social,
            selfmod: this.selfmod,
            filter: this.filter
        };
    }

    static superRegExp(array) {
        return superRegExp(array);
    }

}

module.exports = GuildSettings;
