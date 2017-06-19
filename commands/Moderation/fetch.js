exports.run = async (client, msg, [message, limit = 10]) => {
  if (!/^[0-9]{17,21}$/.test(message)) throw "I was expecting a Message Snowflake (Message ID).";
  const messages = await msg.channel.fetchMessages({ limit, around: message });

  const embed = new client.methods.Embed()
    .setColor(msg.member.highestRole.color || 0xdfdfdf)
    .setTitle(`Context of ${message}`)
    .setDescription(Array.from(messages)
      .reverse()
      .map(m => `${m[1].author.username} ❯ ${m[1].cleanContent || "**`IMAGE/EMBED`**"}`)
      .join("\n"))
    .setFooter(client.user.username, client.user.displayAvatarURL({ size: 128 }));

  return msg.send({ embed });
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
  cooldown: 30,
};

exports.help = {
  name: "fetch",
  description: "Discover the context of a message.",
  usage: "<message:string{17,21}> [limit:int]",
  usageDelim: " ",
};
