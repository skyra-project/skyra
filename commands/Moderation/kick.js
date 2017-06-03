const MODERATION = require("../../utils/managerModeration");

/* eslint-disable no-throw-literal */
exports.run = async (client, msg, [search, ...reason]) => {
  /* Initialize Search */
  const user = await client.funcs.search.User(search, msg.guild, true);
  const member = await msg.guild.fetchMember(user) || null;

  if (member) {
    if (user.id === msg.author.id) throw "Ey! Why would you kick yourself?";
    else if (member.highestRole.position >= msg.member.highestRole.position) throw "The selected member has higher or equal role position than you.";
    else if (!member.kickable) throw "The selected member is not kickable.";
  } else {
    throw "This user is not in this server";
  }

  reason = reason.length ? reason.join(" ") : null;
  user.kickFilter = true;
  await member.kick(reason);
  msg.send(`|\`🔨\`| **KICKED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ""}`).catch(e => client.emit("log", e, "error"));
  await MODERATION.send(client, msg, user, "kick", reason);
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: [],
  permLevel: 2,
  botPerms: ["KICK_MEMBERS"],
  requiredFuncs: [],
  spam: false,
  mode: 2,
  cooldown: 5,
};

exports.help = {
  name: "kick",
  description: "Kick the mentioned user.",
  usage: "<SearchMember:string> <reason:str> [...]",
  usageDelim: " ",
};
