/* eslint-disable no-throw-literal */
exports.run = async (client, msg, [search, ...reason]) => {
  try {
    /* Initialize Search */
    const user = await client.search.User(search, msg.guild, true);
    const member = msg.guild.member(user) || null;

    if (member) {
      if (user.id === msg.author.id) throw "Ey! Why would you kick yourself?";
      else if (member.highestRole.position >= msg.member.highestRole.position) throw "The selected member has higher or equal role position than you.";
      else if (!member.kickable) throw "The selected member is not kickable.";
    } else {
      throw "This user is not in this server";
    }

    user.kickFilter = true;
    await member.kick();
    msg.send(`|\`🔨\`| **KICKED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason.join(" ")}` : ""}`).catch(console.error);

    /* Handle Moderation Logs */
    const moderation = new client.Moderation(msg);
    await moderation.send(user, "kick", reason);
  } catch (e) {
    msg.error(e);
  }
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: [],
  permLevel: 2,
  botPerms: ["KICK_MEMBERS"],
  requiredFuncs: [],
  spam: false,
  mode: 2,
};

exports.help = {
  name: "kick",
  description: "Kick the mentioned user.",
  usage: "<SearchMember:string> <reason:str> [...]",
  usageDelim: " ",
};
