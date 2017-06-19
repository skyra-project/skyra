const MODERATION = require("../../utils/managerModeration");

exports.run = async (client, msg, [search, ...reason]) => {
  const user = await client.funcs.search.User(search, msg.guild, true);
  const member = await msg.guild.fetchMember(user.id).catch(() => null);

  if (member) {
    if (user.id === msg.author.id) throw "why would you warn yourself?";
    else if (member.highestRole.position >= msg.member.highestRole.position) throw "the selected member has higher or equal role position than you.";
  } else {
    throw "this user is not in this server";
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
