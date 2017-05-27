const Moderation = require("./moderation.js");

/* eslint-disable no-underscore-dangle, complexity, no-throw-literal, no-restricted-syntax, no-prototype-builtins */
module.exports = class GuildConfig {
  constructor(guild) {
    Object.defineProperty(this, "client", { value: guild.client });
    Object.defineProperty(this, "guild", { value: guild });
    Object.defineProperty(this, "_configuration", { value: this.client.guildCache.get(guild.id) || { events: { sendMessage: {} }, exists: false } });
    Object.defineProperty(this, "exists", { value: this._configuration.exists !== false });
    Object.defineProperty(this, "_mutes", { value: this._configuration.mutes || [] });
    this.id = guild.id;
    this.createdAt = this._configuration.createdAt || null;
    this.events.sendMessage = this._configuration.events.sendMessage || {};
    this.mode = this._configuration.mode || 0;
    this.prefix = this._configuration.prefix || "&";
    this.wordFilter = this._configuration.wordFilter || 0;
    this.initialRole = this._configuration.initialRole || null;
  }

  get roles() {
    return this._configuration.roles || {};
  }

  get moderation() {
    return new Moderation(this.guild);
  }

  get events() {
    return this._configuration.events || {};
  }

  get channels() {
    return this._configuration.channels || {};
  }

  get messages() {
    return this.events.sendMessage || {};
  }

  get selfmod() {
    return this._configuration.selfmod || {};
  }

  get disabledCommands() {
    return this._configuration.disabledCommands || [];
  }

  get disabledCmdChannels() {
    return this._configuration.disabledCmdChannels || [];
  }

  get publicRoles() {
    return this._configuration.publicRoles || [];
  }

  get autoroles() {
    return this._configuration.autoroles || [];
  }

  get ignoreChannels() {
    return this._configuration.ignoreChannels || [];
  }

  get mutes() {
    const mutes = new this.client.methods.Collection();
    this._mutes.map(m => mutes.set(m.user, m));
    return mutes;
  }

  async create() {
    if (this.exists) throw "This GuildConfig already exists.";
    new this.client.Create(this.client).CreateGuild(this.id);
  }

  async ensureConfigs() {
    if (!this.exists) new this.client.Create(this.client).CreateGuild(this.id);
  }

  async update(doc) {
    await this.ensureConfigs();
    await this.client.rethink.update("guilds", this.id, doc);
    await this.sync();
  }

  async sync() {
    const data = await this.client.rethink.get("guilds", this.id);
    if (!data) throw "[404] Not found.";
    this.client.guildCache.set(this.id, data);
  }

  async destroy() {
    if (!this.exists) throw "This GuildConfig does not exist.";
    await this.client.rethink.delete("guilds", this.id);
    this.client.guildCache.delete(this.id);
  }
};
