const Moderation = require("./moderation.js");

/* eslint-disable no-underscore-dangle, complexity, no-throw-literal, no-restricted-syntax, no-prototype-builtins */
module.exports = class GuildConfig {
  constructor(guild) {
    Object.defineProperty(this, "client", { value: guild.client });
    Object.defineProperty(this, "guild", { value: guild });
    Object.defineProperty(this, "_configuration", { value: this.client.guildCache.get(guild.id) || { events: { sendMessage: {} }, exists: false } });
    Object.defineProperty(this, "moderation", { value: new Moderation(guild) });
    Object.defineProperty(this, "exists", { value: this._configuration.exists !== false });
    this.id = guild.id;
    this.createdAt = this._configuration.createdAt || null;
    this.roles = this._configuration.roles || {};
    this.channels = this._configuration.channels || {};
    this.events = this._configuration.events;
    this.events.sendMessage = this._configuration.events.sendMessage || {};
    this.mode = this._configuration.mode || 0;
    this.prefix = this._configuration.prefix || "&";
    this.wordFilter = this._configuration.wordFilter || 0;
    this.selfmod = this._configuration.selfmod || {};
    this.initialRole = this._configuration.initialRole || null;
    this.ignoreChannels = this._configuration.ignoreChannels || [];
    this.disabledCommands = this._configuration.disabledCommands || [];
    this.publicRoles = this._configuration.publicRoles || [];
    this.autoroles = this._configuration.autoroles || [];
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
