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
    constructor(guild) {
        Object.defineProperty(this, "client", { value: guild.client });
        Object.defineProperty(this, "guild", { value: guild });
        Object.defineProperty(this, "raw", { value: GuildManager.get(this.id) });
        this.id = guild.id;
        this.prefix = GuildManager.prefix(this.guild) || defaults.prefix;

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
        if (this.exists) throw "This GuildConfig already exists.";
        GuildManager.create(this.guild);
    }

    async ensureConfigs() {
        return !this.exists ? GuildManager.create(this.guild) : false;
    }

    async update(doc) {
        await this.ensureConfigs();
        if ("prefix" in doc) GuildManager.refreshPrefix(this.guild);
        await Rethink.update("guilds", this.id, doc);
        await this.sync();
    }

    async sync() {
        const data = await Rethink.get("guilds", this.id);
        if (!data) throw "[404] Not found.";
        GuildManager.set(this.id, data);
        return true;
    }

    async destroy() {
        if (!this.exists) throw "This GuildConfig does not exist.";
        const output = await Rethink.delete("guilds", this.id);
        GuildManager.delete(this.id);
        return output;
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
