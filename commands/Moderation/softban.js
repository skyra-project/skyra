/* eslint-disable no-throw-literal */
exports.run = async (client, msg, [search, days = 1, ...reason]) => {
  try {
    /* Initialize Search */
    const user = await client.search.User(search, msg.guild, true);
    const member = msg.guild.member(user) || null;

    if (member) {
      if (user.id === msg.author.id) throw "Ey! Why would you ban yourself?";
      else if (member.highestRole.position >= msg.member.highestRole.position) throw "The selected member has higher or equal role position than you.";
      else if (!member.kickable) throw "The selected member is not bannable.";
    } else {
      throw "This user is not in this server";
    }

    user.banFilter = true;
    await msg.guild.ban(user, days);
    await msg.guild.unban(user);

    /* Handle Moderation Logs */
    const moderation = new client.Moderation(msg);
    await moderation.send(user, "softban", reason);
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
  spam: false,
  mode: 2,
};

exports.help = {
  name: "softban",
  description: "Softban the mentioned user.",
  usage: "<SearchMember:str> [days:int] [reason:str] [...]",
  usageDelim: " ",
};
