const RethinkDB = require("../functions/rethinkDB.js");
const { Collection } = require("discord.js");

const data = new Collection();

/* eslint-disable no-underscore-dangle */
exports.get = user => data.get(user.id || user) || { points: 0, exists: false };

exports.set = (user, object) => data.set(user.id || user, object);

exports.delete = user => data.delete(user.id || user) || null;

exports.fetchAll = () => data;

/* Methods to create new Configuration Objects */
exports.create = async (user) => {
  const object = this.guildData;
  object.id = user.id;
  const output = await RethinkDB.add("users", object);
  this.set(user, object);
  return output;
};

exports.userData = {
  points: 0,
  color: "ff239d",
  banners: {},
};
