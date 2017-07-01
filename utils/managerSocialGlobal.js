const { Collection } = require("discord.js");

const data = new Collection();

/* eslint-disable no-underscore-dangle */
exports.get = user => data.get(user);

exports.has = user => data.has(user);

exports.set = (user, object) => data.set(user, object);

exports.delete = user => data.delete(user) || null;

exports.fetchAll = () => data;
