const { Collection } = require('discord.js');

const data = new Collection();

exports.get = guild => data.get(guild);

exports.set = (guild, object) => data.set(guild, object);

exports.delete = guild => data.delete(guild) || null;

exports.all = () => data;
