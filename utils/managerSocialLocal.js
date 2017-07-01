const RethinkDB = require("../providers/rethink");
const { Collection } = require("discord.js");

const data = new Collection();

/* eslint-disable no-underscore-dangle */
exports.get = guild => data.get(guild) || data.set(guild, new Collection());

exports.fetch = (guild, member) => this.get(guild).get(member);

exports.set = (guild, object) => data.set(guild, object);

exports.insert = (guild, member, object) => this.get(guild).set(member, object);

exports.destroy = async (guild) => {
    const output = await RethinkDB.delete("localScores", guild);
    data.delete(guild);
    return output;
};

exports.fetchAll = () => data;
