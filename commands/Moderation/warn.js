const MODERATION = require("../../utils/managerModeration");

/* eslint-disable no-throw-literal */
exports.run = async (client, msg, [search, ...reason]) => {
  /* Initialize Search */
  const user = await client.funcs.search.User(search, msg.guild, true);
  const member = await msg.guild.fetchMember(user) || null;

  if (member) {
    if (user.id === msg.author.id) throw "Ey! Why would you warn yourself?";
    else if (member.highestRole.position >= msg.member.highestRole.position) throw "The selected member has higher or equal role position than you.";
  } else {
    throw "This user is not in this server";
  }

  reason = reason.length ? reason.join(" ") : null;
  msg.send(`|\`🔨\`| **WARNED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ""}`).catch(e => client.emit("log", e, "error"));
  await MODERATION.send(client, msg, user, "warn", reason);
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: ["warning", "strike"],
  permLevel: 1,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 2,
  cooldown: 5,
};

exports.help = {
  name: "warn",
  description: "Strike the mentioned user.",
  usage: "<SearchMember:str> [reason:str] [...]",
  usageDelim: " ",
};
