exports.run = async (client, msg, [searchMessage, searchChannel = msg.channel]) => {
  try {
    if (!/[0-9]{17,18}/.test(searchMessage)) throw new ReferenceError("Invalid message ID");
    const channel = await client.search.Channel(searchChannel, msg.guild);
    const m = await channel.fetchMessage(searchMessage);

    const attachments = m.attachments.size ? m.attachments.map(att => att.url) : null;

    await msg.sendCode("md", m.content + (attachments ? `\n\n\n================\n**Attachments:**\n${attachments.join("\n")}` : ""));
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
