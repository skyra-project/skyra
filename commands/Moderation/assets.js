exports.run = async (client, msg, [piece]) => {
  const assets = new client.Assets(client);
  const messageSend = await msg.send("`Processing...`");
  try {
    switch (piece.toLowerCase()) {
      case "mute": {
        const response = await assets.createMuted(msg, messageSend);
        await msg.send(response);
        break;
      }
      // no default
    }
  } catch (e) {
    await msg.send(e);
  } finally {
    messageSend.nuke(5000);
  }
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: [],
  permLevel: 3,
  botPerms: ["MANAGE_CHANNELS", "MANAGE_ROLES_OR_PERMISSIONS"],
  requiredFuncs: [],
  spam: false,
  mode: 2,
  cooldown: 300,
};

exports.help = {
  name: "assets",
  description: "Discover the context of a message.",
  usage: "<mute>",
  usageDelim: "",
  extendedHelp: "",
};
