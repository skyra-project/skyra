const MODERATION = require("../../utils/managerModeration");

/* eslint-disable no-throw-literal, complexity */
exports.run = async (client, msg, [search, ...reason]) => {
  /* Initialize Search */
  const user = await client.funcs.search.User(search, msg.guild, true);
  const member = await msg.guild.fetchMember(user) || null;

  if (member) {
    if (user.id === msg.author.id) throw "Ey! Why would you mute yourself?";
    else if (member.highestRole.position >= msg.member.highestRole.position) throw "The selected member has higher or equal role position than you.";
  } else {
    throw "This user is not in this server";
  }

  const configs = msg.guild.configs;
  if (!configs) throw "You caught me while creating the configuration for this server.";

  const mute = configs.roles.muted;
  if (!configs.roles.muted) throw "There's no mute role configured.";

  const muteRole = msg.guild.roles.get(mute);
  if (!muteRole) throw "You configured a mute role, but you deleted it when I was not ready.";

  const mutedUser = await msg.guild.moderation.getMute(user.id);
  if (!mutedUser) throw "This user is not muted.";

  const roles = mutedUser.extraData || [];

  reason = reason.length ? reason.join(" ") : null;
  await member.edit({ roles });
  msg.send(`|\`🔨\`| **UNMUTED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ""}`).catch(e => client.emit("log", e, "error"));
  await MODERATION.send(client, msg, user, "unmute", reason, roles);
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: [],
  permLevel: 2,
  botPerms: ["MANAGE_ROLES"],
  requiredFuncs: [],
  spam: false,
  mode: 2,
  cooldown: 5,
};

exports.help = {
  name: "unmute",
  description: "Unmute the mentioned user.",
  usage: "<SearchMember:str> [reason:str] [...]",
  usageDelim: " ",
};
