exports.run = async (client, msg, [limit]) => {
  let messages = await msg.channel.fetchMessages({ limit });
  messages = messages.filter(m => m.author === client.user);
  for (const message of messages.values()) message.nuke().catch(e => client.emit("error", e)); // eslint-disable-line no-restricted-syntax
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: [],
  permLevel: 10,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 2,
};

exports.help = {
  name: "clear",
  description: "Clear some messages from me.",
  usage: "<limit:int>",
  usageDelim: "",
  extendedHelp: "",
};
