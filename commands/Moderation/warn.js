/* eslint-disable no-throw-literal */
exports.run = async (client, msg, [search, ...reason]) => {
  /* Initialize Search */
  const user = await client.funcs.search.User(search, msg.guild, true);
  const member = msg.guild.member(user) || null;

  if (member) {
    if (user.id === msg.author.id) throw "Ey! Why would you warn yourself?";
    else if (member.highestRole.position >= msg.member.highestRole.position) throw "The selected member has higher or equal role position than you.";
  } else {
    throw "This user is not in this server";
  }

  msg.send(`|\`🔨\`| **WARNED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason.join(" ")}` : ""}`).catch(console.error);

  /* Handle Moderation Logs */
  const moderation = new client.Moderation(msg);
  await moderation.send(user, "warn", reason);
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
