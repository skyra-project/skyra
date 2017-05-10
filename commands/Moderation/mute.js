/* eslint-disable no-throw-literal, no-underscore-dangle */
class Mute {
  constructor(msg) {
    Object.defineProperty(this, "msg", { value: msg });
    Object.defineProperty(this, "guild", { value: msg.guild });
    Object.defineProperty(this, "client", { value: msg.client });
  }

  async configuration() {
    const configuration = this.guild.configs;
    if (!configuration) throw "You caught me while creating the configuration for this server.";
    if (!configuration.roles.muted) {
      const message = await this.msg.Prompt("Do you want to create and configure the Mute role right now?");
      const assets = new this.client.Assets(this.client);
      const mute = assets.createMuted(this.msg, message);
      return (mute);
    }
    return (this.guild.roles.get(configuration.roles.muted));
  }
}

exports.run = async (client, msg, [search, ...reason]) => {
  /* Initialize Search */
  const user = await client.search.User(search, msg.guild, true);
  const member = msg.guild.member(user) || null;

  if (member) {
    if (user.id === msg.author.id) throw "Ey! Why would you mute yourself?";
    else if (member.highestRole.position >= msg.member.highestRole.position) throw "The selected member has higher or equal role position than you.";
  } else {
    throw "This user is not in this server";
  }

  const MuteClass = new Mute(msg);
  const mute = await MuteClass.configuration();

  if (client.configs.get(msg.guild.id).mutes.has(user.id)) throw "This user is already muted.";

  const roles = member._roles;
  await member.addRole(mute.id);
  if (roles.length > 0) await member.removeRoles(roles);
  msg.send(`|\`🔨\`| **MUTED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason.join(" ")}` : ""}`).catch(console.error);

  /* Handle Moderation Logs */
  const moderation = new client.Moderation(msg);
  await moderation.send(user, "mute", reason, roles);
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: [],
  permLevel: 1,
  botPerms: ["MANAGE_ROLES_OR_PERMISSIONS"],
  requiredFuncs: [],
  spam: false,
  mode: 2,
  cooldown: 5,
};

exports.help = {
  name: "mute",
  description: "Mute the mentioned user.",
  usage: "<SearchMember:user> [reason:str] [...]",
  usageDelim: " ",
};
