const RethinkDB = require("../functions/rethinkDB.js");
const { Collection } = require("discord.js");

const data = new Collection();

/* eslint-disable no-underscore-dangle */
exports.get = guild => data.get(guild.id || guild) || data.set(guild.id || guild, new Collection());

exports.fetch = member => this.get(member.guild).get(member.id) || { score: 0, exists: false };

exports.set = (guild, object) => data.set(guild.id || guild, object);

exports.insert = (member, object) => this.get(member.guild).set(member.id, object);

exports.delete = guild => data.delete(guild.id || guild);

exports.fetchAll = () => data;

exports.update = async (member, score) => {
  const output = await RethinkDB.updateArray("localScores", member.guild.id, "scores", member.id, { score });
  data.get(member.guild.id).get(member.id).score = score;
  return output;
};

/* Methods to create new Configuration Objects */
exports.create = async (member) => {
  const object = { id: member.id, score: 0 };
  const output = await RethinkDB.append("localScores", member.guild.id, "scores", object);
  this.insert(member, object);
  return output;
};
