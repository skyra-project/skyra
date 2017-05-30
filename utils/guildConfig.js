const Moderation = require("./moderation");
const GuildManager = require("./guildManager");

/* eslint-disable no-underscore-dangle, no-throw-literal, no-restricted-syntax, no-prototype-builtins */
module.exports = class GuildConfig {
  constructor(guild) {
    Object.defineProperty(this, "client", { value: guild.client });
    Object.defineProperty(this, "guild", { value: guild });
    this.id = guild.id;
  }

  get prefix() {
    return GuildManager.prefix(this.guild) || "&";
  }

  get _configuration() {
    return GuildManager.get(this.id);
  }

  async create() {
    if (this.exists) throw "This GuildConfig already exists.";
    GuildManager.create(this.guild);
  }

  async ensureConfigs() {
    if (!this.exists) GuildManager.create(this.guild);
  }

  async update(doc) {
    await this.ensureConfigs();
    if ("prefix" in doc) GuildManager.refreshPrefix(this.guild);
    await this.client.rethink.update("guilds", this.id, doc);
    await this.sync();
  }

  async sync() {
    const data = await this.client.rethink.get("guilds", this.id);
    if (!data) throw "[404] Not found.";
    GuildManager.set(this.id, data);
  }

  async destroy() {
    if (!this.exists) throw "This GuildConfig does not exist.";
    await this.client.rethink.delete("guilds", this.id);
    GuildManager.delete(this.id);
  }

  /* Properties */

  get createdAt() {
    return this._configuration.createdAt || null;
  }

  get exists() {
    return this._configuration.exists !== false;
  }

  get mode() {
    return this._configuration.mode || 0;
  }

  get wordFilter() {
    return this._configuration.wordFilter || 0;
  }

  get initialRole() {
    return this._configuration.initialRole || null;
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

  get _mutes() {
    return this._configuration.mutes || [];
  }

  get mutes() {
    const mutes = new this.client.methods.Collection();
    this._mutes.map(m => mutes.set(m.user, m));
    return mutes;
  }
};
