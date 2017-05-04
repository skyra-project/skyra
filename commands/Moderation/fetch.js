exports.run = async (client, msg, [message, limit = 10]) => {
  try {
    if (!/^[0-9]{17,18}$/.test(message)) throw new Error("Invalid message ID.");
    const messages = await msg.channel.fetchMessages({ limit, around: message });

    const embed = new client.methods.Embed()
      .setColor(msg.member.highestRole.color || 0xdfdfdf)
      .setTitle(`Context of ${message}`)
      .setDescription(messages
        .array()
        .reverse()
        .map(m => `${m.author.username} ❯ ${m.cleanContent || "**`IMAGE/EMBED`**"}`)
        .join("\n"))
      .setFooter(client.user.username, client.user.displayAvatarURL);

    msg.sendEmbed(embed);
  } catch (e) {
    msg.error(e);
  }
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: [],
  permLevel: 1,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 2,
};

exports.help = {
  name: "fetch",
  description: "Discover the context of a message.",
  usage: "<message:str{17,18}> [limit:int]",
  usageDelim: " ",
};
