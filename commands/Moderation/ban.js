const MODERATION = require("../../utils/managerModeration");

exports.run = async (client, msg, [user, ...reason]) => {
  const member = await msg.guild.fetchMember(user.id).catch(() => null);

  if (user.id === msg.author.id) {
    throw "why would you ban yourself?";
  } else if (member) {
    if (member.highestRole.position >= msg.member.highestRole.position) throw "the selected member has higher or equal role position than you.";
    else if (!member.bannable) throw "the selected member is not bannable.";
  }

  reason = reason.length ? reason.join(" ") : null;
  user.action = "ban";
  await msg.guild.ban(user.id, { days: 7, reason });
  msg.send(`|\`🔨\`| **BANNED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ""}`).catch(e => client.emit("log", e, "error"));
  await MODERATION.send(client, msg, user, "ban", reason);
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
  name: "ban",
  description: "Ban the mentioned user.",
  usage: "<SearchMember:user> [reason:string] [...]",
  usageDelim: " ",
};
