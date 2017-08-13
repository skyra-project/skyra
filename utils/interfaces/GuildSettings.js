const provider = require('../../providers/rethink');
const Moderation = require('./moderation');
const Schema = require('../../schema.json');

const superRegExp = (filterArray) => {
    const filtered = filterArray.reduce((acum, item, index) => acum + (index ? '|' : '') +
        item.replace(/\w(?=(\w)?)/g, (letter, nextWord) => `${letter}+${nextWord ? '\\W*' : ''}`), '');
    return new RegExp(`\\b(?:${filtered})\\b`, 'i');
};

/**
 * Global settings for guilds.
 * @class GuildSettings
 */
class GuildSettings {

    constructor(id, data = {}) {
        Object.defineProperty(this, 'id', { value: id });

        this._merge(data, 'master');
        this._merge(data, 'disable');
        this._merge(data, 'roles');
        this._merge(data, 'events');
        this._merge(data, 'channels');
        this._merge(data, 'messages');
        this._merge(data, 'selfmod');
        this._merge(data, 'filter');
        this.filter.regexp = null;

        if (!data.social) data.social = {};
        this.social = {
            boost: data.social.boost || 1,
            monitorBoost: data.social.monitorBoost || 1
        };

        this.moderation = null;
    }

    _merge(data, group) {
        this[group] = {};

        if (group in data === false) data[group] = {};
        for (const [key, value] of Object.entries(Schema[group])) {
            this[group][key] = data[group][key] || value.default || null;
        }
    }

    setModeration(modlogs) {
        this.moderation = new Moderation(this.id, modlogs);
        return this.moderation;
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

    updateFilter() {
        this.filter.regexp = superRegExp(this.filter.raw);
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
            filter: {
                level: this.filter.level,
                raw: this.filter.raw
            }
        };
    }

    static superRegExp(array) {
        return superRegExp(array);
    }

}

module.exports = GuildSettings;
