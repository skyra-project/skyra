const Moderation = require("./moderation.js");

/* eslint-disable no-underscore-dangle, complexity, no-throw-literal */
module.exports = class GuildConfig {
  constructor(guild) {
    Object.defineProperty(this, "client", { value: guild.client });
    Object.defineProperty(this, "guild", { value: guild });
    Object.defineProperty(this, "_configuration", { value: this.client.guildCache.get(guild.id) || { sendMessage: false, modLogProtection: {} } });
    Object.defineProperty(this, "moderation", { value: new Moderation(guild) });
    this.id = guild.id;
    this.createdAt = this._configuration.createdAt || null;
    this.roles = this._configuration.roles || {};
    this.channels = this._configuration.channels || {};
    this.events = this._configuration.events;
    this.events.sendMessage = this._configuration.events.sendMessage || {};
    this.events.modLogProtection = this._configuration.events.modLogProtection || false;
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

  get exists() {
    return this.client.guildCache.has(this.id);
  }

  async create() {
    if (this.exists) throw "This GuildConfig already exists.";
    new this.client.Create(this.client).CreateGuild(this.id);
  }

  async sync() {
    const data = await this.client.rethink.get("guilds", this.id);
    if (!data) throw "[404] Not found.";
    if (this.exists) this.client.guildCache.delete(this.id);
    this.client.guildCache.set(this.id, data);
  }

  async destroy() {
    if (!this.exists) throw "This GuildConfig does not exist.";
    await this.client.rethink.delete("guilds", this.id);
    this.client.guildCache.delete(this.id);
  }
};
