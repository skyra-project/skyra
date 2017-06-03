const MODERATION = require("../../utils/managerModeration");

exports.run = async (client, msg, [search, ...reason]) => {
  /* Initialize Search */
  const user = await client.funcs.search.User(search, msg.guild, true);
  const member = await msg.guild.fetchMember(user) || null;

  if (user.id === msg.author.id) {
    throw "Ey! Why would you ban yourself?";
  } else if (member) {
    if (member.highestRole.position >= msg.member.highestRole.position) throw "The selected member has higher or equal role position than you.";
    else if (!member.bannable) throw "The selected member is not bannable.";
  }

  reason = reason.length ? reason.join(" ") : null;
  user.action = "ban";
  await msg.guild.ban(user, { days: 7, reason });
  await msg.send(`|\`🔨\`| **BANNED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ""}`).catch(e => client.emit("log", e, "error"));
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
  usage: "<SearchMember:string> [reason:str] [...]",
  usageDelim: " ",
};
