/* eslint-disable no-throw-literal, no-underscore-dangle */
class Mute {
  constructor(msg) {
    Object.defineProperty(this, "msg", { value: msg });
    Object.defineProperty(this, "guild", { value: msg.guild });
    Object.defineProperty(this, "client", { value: msg.client });
  }

  async configuration() {
    const configuration = this.guild.configs;
    if (!configuration.roles.muted) {
      const message = await this.msg.Prompt("Do you want to create and configure the Mute role right now?");
      const mute = this.client.Assets.createMuted(this.msg, message);
      return (mute);
    }
    return (this.guild.roles.get(configuration.roles.muted));
  }
}

exports.run = async (client, msg, [search, ...reason]) => {
  /* Initialize Search */
  const user = await client.funcs.search.User(search, msg.guild, true);
  const member = msg.guild.member(user) || null;

  if (member) {
    if (user.id === msg.author.id) throw "Ey! Why would you mute yourself?";
    else if (member.highestRole.position >= msg.member.highestRole.position) throw "The selected member has higher or equal role position than you.";
  } else {
    throw "This user is not in this server";
  }

  const MuteClass = new Mute(msg);
  const mute = await MuteClass.configuration();

  if (msg.guild.configs.mutes.has(user.id)) throw "This user is already muted.";

  const roles = member._roles;
  await member.edit({ roles: [mute.id] });
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
  usage: "<SearchMember:str> [reason:str] [...]",
  usageDelim: " ",
};
