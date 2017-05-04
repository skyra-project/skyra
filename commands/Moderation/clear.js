exports.run = async (client, msg, [limit]) => {
  let messages = await msg.channel.fetchMessages({ limit });
  messages = messages.filter(m => m.author === client.user);
  for (const message of messages.values()) { // eslint-disable-line no-restricted-syntax
    message.nuke().catch(e => console.error(e.message));
  }
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
