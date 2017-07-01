const Rethink = require("../providers/rethink");
const Moderation = require("./moderation");
const GuildManager = require("./guildManager");

const defaults = {
    prefix: "s!",
    roles: {},
    events: {},
    channels: {},
    messages: {},
    selfmod: {},

    ignoreChannels: [],
    disabledCommands: [],
    disabledCmdChannels: [],
    publicRoles: [],
    autoroles: [],

    mode: 0,
    wordFilter: 0,
    initialRole: null,
    social: {
        boost: 1,
        monitorBoost: 1,
    },
};

const GuildSetting = class GuildSetting {
    constructor(guild, data) {
        Object.defineProperty(this, "raw", { value: data });
        this.id = guild;
        this.prefix = this.raw.prefix || defaults.prefix;

        this.roles = this.raw.roles || defaults.roles;
        this.events = this.raw.events || defaults.events;
        this.channels = this.raw.channels || defaults.channels;
        this.messages = this.raw.messages || defaults.messages;
        this.selfmod = this.raw.selfmod || defaults.selfmod;

        this.ignoreChannels = this.raw.ignoreChannels || defaults.ignoreChannels;
        this.disabledCommands = this.raw.disabledCommands || defaults.disabledCommands;
        this.disabledCmdChannels = this.raw.disabledCmdChannels || defaults.disabledCmdChannels;
        this.publicRoles = this.raw.publicRoles || defaults.publicRoles;
        this.autoroles = this.raw.autoroles || defaults.autoroles;

        this.mode = this.raw.mode || defaults.mode;
        this.wordFilter = this.raw.wordFilter || defaults.wordFilter;
        this.initialRole = this.raw.initialRole || defaults.initialRole;
        this.social = {
            boost: this.raw.boost || defaults.social.boost,
            monitorBoost: this.raw.monitorBoost || defaults.social.monitorBoost,
        };

        this.moderation = new Moderation(this.guild);
    }

    async create() {
        if (this.exists) throw "This GuildSetting already exists.";
        this.raw = Object.assign(defaults, { id: this.id, exists: true });
        await Rethink.create("guilds", this.raw).catch((err) => { throw err; });
        return true;
    }

    ensureConfigs() {
        return !this.exists ? this.create() : false;
    }

    async update(doc) {
        await this.ensureConfigs();
        await Rethink.update("guilds", this.id, doc);
        return this.sync();
    }

    async sync() {
        const data = await Rethink.get("guilds", this.id);
        if (!data) throw "[404] Not found.";
        this.raw = data;
        return true;
    }

    async destroy() {
        if (!this.exists) throw "This GuildConfig does not exist.";
        await Rethink.delete("guilds", this.id);
        GuildManager.delete(this.id);
        return true;
    }

    get createdAt() {
        return this.raw.createdAt || null;
    }

    get exists() {
        return this.raw.exists !== false;
    }

    get rawMutes() {
        return this.raw.mutes || [];
    }

    get mutes() {
        const mutes = new this.client.methods.Collection();
        this.rawMutes.map(m => mutes.set(m.user, m));
        return mutes;
    }
};

module.exports = { GuildSetting, defaults };
