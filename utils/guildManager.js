const RethinkDB = require("../functions/rethinkDB.js");
// const GuildConfigs = require("./guildConfig");

// const configs = guild => new GuildConfigs(guild);

const data = new Map();

/* eslint-disable no-underscore-dangle */
exports.get = guild => data.get(guild.id || guild) || { prefix: "&", exists: false };

exports.set = (guild, object) => data.set(guild.id || guild, object);

exports.delete = guild => data.delete(guild.id || guild) || null;

exports.prefix = (guild) => {
  let prefix = guild.prefix;
  if (!prefix) {
    const temporalPrefix = this.get(guild).prefix || "&";
    guild.prefix = temporalPrefix;
    prefix = temporalPrefix;
  }
  return prefix;
};

exports.refreshPrefix = (guild) => { guild.prefix = this.get(guild).prefix || "&"; };

/* Methods to create new Configuration Objects */
exports.create = async (guild) => {
  const object = this.guildData;
  object.id = guild.id;
  const output = await RethinkDB.add("guilds", object);
  this.set(guild, object);
  return output;
};

exports.guildData = {
  createdAt: Date.now(),
  roles: { },
  channels: { },
  events: { sendMessage: {} },
  mode: 0,
  prefix: "&",
  wordFilter: 0,
  selfmod: {},
  ignoreChannels: [],
  disabledCommands: [],
  publicRoles: [],
  autoroles: [],
};
