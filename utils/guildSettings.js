const Rethink = require("../providers/rethink");
const Moderation = require("./moderation");
const GuildManager = require("./guildManager");

const superRegExp = (filterArray) => {
    const filtered = filterArray.reduce((acum, item, index) => acum + (index ? "|" : "") +
        item.replace(/\w(?=(\w)?)/g, (letter, nextWord) => `${letter}+${nextWord ? "\\W*" : ""}`), "");
    return new RegExp(`\\b(?:${filtered})\\b`, "i");
};

const defaults = {
    prefix: "s!",
    roles: {},
    events: {},
    channels: {},
    messages: {},

    ignoreChannels: [],
    disabledCommands: [],
    disabledCmdChannels: [],
    publicRoles: [],
    autoroles: [],

    mode: 0,
    initialRole: null,
    social: {
        boost: 1,
        monitorBoost: 1,
    },

    selfmod: {
        ghostmention: false,
        inviteLinks: false,
        nomentionspam: false,
        nmsthreshold: 20,
    },

    filter: {
        level: 0,
        raw: [],
    },
};

/* eslint-disable no-restricted-syntax */
const GuildSetting = class GuildSetting {

    constructor(guild, data) {
        this.id = guild;
        this.prefix = data.prefix || defaults.prefix;

        this.roles = data.roles || defaults.roles;
        this.events = data.events || defaults.events;
        this.channels = data.channels || defaults.channels;
        this.messages = data.messages || defaults.messages;

        this.ignoreChannels = data.ignoreChannels || defaults.ignoreChannels;
        this.disabledCommands = data.disabledCommands || defaults.disabledCommands;
        this.disabledCmdChannels = data.disabledCmdChannels || defaults.disabledCmdChannels;
        this.publicRoles = data.publicRoles || defaults.publicRoles;
        this.autoroles = data.autoroles || defaults.autoroles;

        this.mode = data.mode || defaults.mode;
        this.initialRole = data.initialRole || defaults.initialRole;
        this.social = {
            boost: data.boost || defaults.social.boost,
            monitorBoost: data.monitorBoost || defaults.social.monitorBoost,
        };

        if (!data.selfmod) data.selfmod = defaults.selfmod;
        this.selfmod = {
            ghostmention: data.selfmod.ghostmention || defaults.selfmod.ghostmention,
            inviteLinks: data.selfmod.inviteLinks || defaults.selfmod.inviteLinks,
            nomentionspam: data.selfmod.nomentionspam || defaults.selfmod.nomentionspam,
            nmsthreshold: data.selfmod.nmsthreshold || defaults.selfmod.nmsthreshold,
        };

        if (!data.filter) data.filter = defaults.filter;
        this.filter = {
            level: data.filter.level || defaults.filter.level,
            raw: data.filter.raw || defaults.filter.raw,
            regexp: data.filter.raw instanceof Array && data.filter.raw.length ? superRegExp(data.filter.raw) : null,
        };

        this.exists = data.exists !== false;

        this.moderation = new Moderation(this.id, data.mutes || []);
    }

    async create() {
        if (this.exists) throw "This GuildSetting already exists.";
        const data = Object.assign(defaults, { id: this.id, exists: true });
        await Rethink.create("guilds", data).catch((err) => { throw err; });
        return true;
    }

    ensureConfigs() {
        return !this.exists ? this.create() : false;
    }

    async update(doc) {
        await this.ensureConfigs();
        await Rethink.update("guilds", this.id, doc);
        for (const key of Object.keys(doc)) {
            if (doc[key] instanceof Object) {
                for (const subkey of Object.keys(doc[key])) this[key][subkey] = doc[key][subkey];
            } else {
                this[key] = doc[key];
            }
        }
        return this;
    }

    async destroy() {
        if (!this.exists) throw "This GuildConfig does not exist.";
        await Rethink.delete("guilds", this.id);
        GuildManager.delete(this.id);
        return true;
    }

};

module.exports = { GuildSetting, defaults, superRegExp };
