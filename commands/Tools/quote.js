exports.run = async (client, msg, [searchMessage, searchChannel = msg.channel]) => {
  if (!/[0-9]{17,21}/.test(searchMessage)) throw "I was expecting a Message Snowflake (Message ID).";
  const channel = await client.funcs.search.Channel(searchChannel, msg.guild);
  const m = await channel.fetchMessage(searchMessage);

  const attachment = m.attachments.size ? m.attachments.find(att => /jpg|png|webp|gif/.test(att.url.split(".").pop())) : null;
  if (!attachment && !m.content) throw "it is weird, but this message doesn't have a content nor image.";

  const embed = new client.methods.Embed()
    .setAuthor(m.author.tag, m.author.displayAvatarURL({ size: 128 }))
    .setDescription(m.content)
    .setImage(attachment ? attachment.url : null)
    .setTimestamp(m.createdAt);
  return msg.send({ embed });
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: [],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 2,
  cooldown: 30,
};

exports.help = {
  name: "quote",
  description: "Quote another people's message.",
  usage: "<message:str> [channel:str]",
  usageDelim: " ",
  extendedHelp: "",
};
