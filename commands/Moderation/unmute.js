/* eslint-disable no-throw-literal, complexity */
exports.run = async (client, msg, [search, ...reason]) => {
  try {
    /* Initialize Search */
    const user = await client.search.User(search, msg.guild, true);
    const member = msg.guild.member(user) || null;

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

    const mutedUser = configs.mutes.get(user.id);
    if (!mutedUser) throw "This user is not muted.";

    const roles = mutedUser.extraData;
    await member.removeRole(muteRole.id);
    if (roles && roles instanceof Array && roles.length > 0) await member.addRoles(roles);
    msg.send(`|\`🔨\`| **UNMUTED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason.join(" ")}` : ""}`).catch(console.error);
    configs.mutes.delete(user.id);

    /* Handle Moderation Logs */
    const moderation = new client.Moderation(msg);
    await moderation.send(user, "unmute", reason, roles);
  } catch (e) {
    msg.error(e);
  }
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: [],
  permLevel: 2,
  botPerms: ["MANAGE_ROLES_OR_PERMISSIONS"],
  requiredFuncs: [],
};

exports.help = {
  name: "unmute",
  description: "Unmute the mentioned user.",
  usage: "<SearchMember:user> [reason:str] [...]",
  usageDelim: " ",
};
