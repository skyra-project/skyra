const MODERATION = require("../../utils/managerModeration");

/* eslint-disable no-throw-literal */
exports.run = async (client, msg, [search, days = 7, ...reason]) => {
  /* Initialize Search */
  const user = await client.funcs.search.User(search, msg.guild, true);
  const member = await msg.guild.fetchMember(user) || null;

  if (member) {
    if (user.id === msg.author.id) throw "Ey! Why would you ban yourself?";
    else if (member.highestRole.position >= msg.member.highestRole.position) throw "The selected member has higher or equal role position than you.";
    else if (!member.kickable) throw "The selected member is not bannable.";
  } else {
    throw "This user is not in this server";
  }

  reason = reason.length ? reason.join(" ") : null;
  user.banFilter = true;
  await msg.guild.ban(user, { days, reason: `${reason ? `Softban with reason: ${reason}` : null}` });
  await msg.guild.unban(user, "Softban.");
  msg.send(`|\`🔨\`| **SOFTBANNED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ""}`).catch(e => client.emit("log", e, "error"));
  await MODERATION.send(client, msg, user, "softban", reason);
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: [],
  permLevel: 2,
  botPerms: ["BAN_MEMBERS"],
  requiredFuncs: [],
  spam: false,
  mode: 2,
  cooldown: 5,
};

exports.help = {
  name: "softban",
  description: "Softban the mentioned user.",
  usage: "<SearchMember:str> [days:int] [reason:str] [...]",
  usageDelim: " ",
};
