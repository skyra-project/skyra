/* eslint-disable no-throw-literal */
exports.searchProfile = async (client, msg, search) => {
  if (/[0-9]{17,18}/.test(search) && client.locals.get(msg.guild.id).has(search)) {
    return search;
  }
  const user = await client.search.User(search, msg.guild);
  if (user.bot) throw "You can't modify bot profiles, since they don't have one.";
  if (!client.locals.get(msg.guild.id).has(search)) {
    const data = { id: user.id, score: 0 };
    await client.rethink.append("localScores", msg.guild.id, "scores", data);
    client.locals.get(msg.guild.id).set(msg.author.id, data);
  }
  return user.id;
};

exports.update = async (client, msg, id, value) => {
  await client.rethink.updateArray("localScores", msg.guild.id, "scores", id, { score: value });
  client.locals.get(msg.guild.id).get(id).score = value;
};

exports.handle = (client, msg, action, ID, value) => {
  const profile = client.locals.get(msg.guild.id).get(ID);
  if (action === "add") return profile.score + value;
  return Math.max(profile.score - value, 0);
};

exports.run = async (client, msg, [action, search = msg.author.id, v = null]) => {
  try {
    const ID = await this.searchProfile(client, msg, search);
    if (action === "delete") {
      throw "This action is not available yet.";
      // await this.nuke(client, ID);
      // await msg.alert(`Dear ${msg.author}, you have just nuked the profile from user ID ${ID}`);
    } else {
      if (!v) throw "You must specify an amount of money.";
      const value = this.handle(client, msg, action, ID, v);
      await this.update(client, msg, ID, value);
      await msg.alert(`Dear ${msg.author}, you have just ${action === "add" ? "added" : "removed"} ${v} points from user ID: ${ID}`);
    }
  } catch (e) {
    msg.error(e);
  }
};


exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: ["socialmanage"],
  permLevel: 2,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 1,
  cooldown: 30,
};

exports.help = {
  name: "social",
  description: "Manage the local leaderboards.",
  usage: "<delete|add|remove> <user:str> [value:int]",
  usageDelim: " ",
  extendedHelp: [
    "This guy has not enough points... Let's increase it!",
    "",
    "NOTE! This command only modifies LOCAL points, not global. You can remove a user from the local leaderboards, or add/remove points from him. Also, you can't set a negative number, it'll be limited between 0 and 2^64",
  ].join("\n"),
};
