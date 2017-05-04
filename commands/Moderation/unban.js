const fetchBan = (guild, query) => new Promise(async (resolve, reject) => {
  const users = await guild.fetchBans();
  const member = users.find(m => m.id === query) ||
    users.find(m => m.tag === query) ||
    users.find(m => m.username.toLowerCase() === query) ||
    users.find(m => m.username.toLowerCase().startsWith(query)) ||
    reject("User not found.");
  resolve(member);
});

/* eslint-disable no-throw-literal */
exports.run = async (client, msg, [query, ...reason]) => {
  try {
    /* Initialize fetchBan search */
    const user = await fetchBan(msg.guild, query);

    user.action = "unban";
    await msg.guild.unban(user);
    msg.send(`|\`🔨\`| **UNBANNED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason.join(" ")}` : ""}`).catch(console.error);

    /* Handle Moderation Logs */
    const moderation = new client.Moderation(msg);
    await moderation.send(user, "unban", reason);
  } catch (e) {
    msg.error(e);
  }
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: [],
  permLevel: 2,
  botPerms: ["BAN_MEMBERS"],
  requiredFuncs: [],
};

exports.help = {
  name: "unban",
  description: "Unbans an user (you MUST write his name or his ID).",
  usage: "<user:str> [reason:str] [...]",
  usageDelim: " ",
};
