exports.run = async (client, msg) => {
  const message = await msg.sendMessage("Ping?");
  return msg.sendMessage(`Pong! (Roundtrip took: ${message.createdTimestamp - msg.createdTimestamp}ms. Heartbeat: ${Math.round(client.ping)}ms.)`);
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: [],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  requiredSettings: [],
};

exports.help = {
  name: "ping",
  description: "Ping/Pong command. I wonder what this does? /sarcasm",
  usage: "",
  usageDelim: "",
};
