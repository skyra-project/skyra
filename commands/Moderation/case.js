const colour = {
  ban: 0xFF0200,
  unban: 0xFF4443,
  softban: 0xFF1A44,
  kick: 0xFFE604,
  mute: 0xFF6E23,
  unmute: 0xFF8343,
  warn: 0xFF8F2A,
  unwarn: 0xFF9C43,
};

/* eslint-disable no-throw-literal */
exports.run = async (client, msg, [index]) => {
  const cases = await msg.guild.moderation.cases;

  if (!cases[index]) throw "This case doesn't seem to exist.";

  let auto = true;
  let modTag = client.user.tag;
  let modAvatar = client.user.displayAvatarURL;

  const moderator = cases[index].moderator || null;
  if (moderator) {
    await client.fetchUser(moderator).then((user) => {
      auto = false;
      modTag = user.tag;
      modAvatar = user.displayAvatarURL;
    });
  }

  const user = await client.fetchUser(cases[index].user);

  const embed = new client.methods.Embed()
    .setColor(colour[cases[index].type])
    .setAuthor(modTag, modAvatar)
    .setDescription([
      `❯ **Action:** ${cases[index].type}`,
      `❯ **User:** ${user.tag} (${user.id})`,
      `❯ **Reason:** ${cases[index].reason || `Please use \`${msg.guild.configs.prefix}reason ${cases[index].thisCase} to claim.\``}`,
      `${cases[index].appealed ? "\n\n❯ **Case appealed**" : ""}`,
    ].join("\n"))
    .setFooter(`${auto ? "AUTO | " : ""}Case ${cases[index].thisCase}`, client.user.displayAvatarURL);

  msg.sendEmbed(embed);
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: [],
  permLevel: 2,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 2,
  cooldown: 5,
};

exports.help = {
  name: "case",
  description: "Get the information from a case by its index.",
  usage: "<Case:int>",
  usageDelim: " ",
};
