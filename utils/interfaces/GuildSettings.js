const provider = require('../../providers/rethink');
const Moderation = require('./moderation');
const Schema = require('../../schema.json');
const { Collection } = require('discord.js');

const superRegExp = (filterArray) => {
    const filtered = filterArray.reduce((acum, item, index) => acum + (index ? '|' : '')
        + item.replace(/\w(?=(\w)?)/g, (letter, nextWord) => `${letter}+${nextWord ? '\\W*' : ''}`), '');
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
        this._merge(data, 'twitch');
        this._merge(data, 'selfmod');
        this._merge(data, 'filter');
        this._merge(data, 'social');

        this.social.boost = data.social.boost || 1;
        this.social.monitorBoost = data.social.monitorBoost || 1;

        this.filter.regexp = null;
        this.autoroles = data.autoroles || [];

        this.moderation = null;
        this.tags = new Collection(data.tags || []);
        this.init();
    }

    init() {
        if (this.autoroles.length > 0) this.autoroles = this.autoroles.sort((x, y) => +(x.points > y.points) || +(x.points === y.points) - 1);
        if (this.filter.raw.length > 0) this.updateFilter();
    }

    _merge(data, group) {
        this[group] = {};

        if (group in data === false) data[group] = {};
        for (const key of Object.keys(Schema[group])) {
            this[group][key] = data[group][key] || (Schema[group][key].hasOwnProperty('default') ? Schema[group][key].default : null);
        }
    }

    setModeration(modlogs) {
        this.moderation = new Moderation(this.id, modlogs);
        return this.moderation;
    }

    async update(doc) {
        await provider.update('guilds', this.id, doc);
        return this.sync(doc);
    }

    async sync(doc = null) {
        if (doc === null) doc = await provider.get('guilds', this.id);

        for (const [key, value] of Object.entries(doc)) {
            if (key === 'id') continue;

            if (Array.isArray(value) === false && value instanceof Object) {
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
            master: this.master,
            disable: this.disable,
            roles: this.roles,
            events: this.events,
            channels: this.channels,
            messages: this.messages,
            selfmod: this.selfmod,
            social: this.social,
            autoroles: this.autoroles,
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
