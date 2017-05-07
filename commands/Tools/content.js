exports.run = async (client, msg, [searchMessage, searchChannel = msg.channel]) => {
  try {
    if (!/[0-9]{17,18}/.test(searchMessage)) throw new ReferenceError("Invalid message ID");
    const channel = await client.search.Channel(searchChannel, msg.guild);
    const m = await channel.fetchMessage(searchMessage);

    const attachment = m.attachments.size ? m.attachments.find(att => /jpg|png|webp|gif/.test(att.url.split(".").pop())) : null;
    if (!attachment && !m.content) throw new Error("This message doesn't have a content nor image.");

    await msg.sendCode("md", m.content || "Empty message");
  } catch (e) {
    msg.error(e);
  }
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
  name: "content",
  description: "Get messages' raw content.",
  usage: "<message:str> [channel:str]",
  usageDelim: " ",
  extendedHelp: "",
};
