const ASSETS = require("../../utils/assets");

exports.run = async (client, msg, [piece]) => {
  await msg.send("`Processing...`");
  switch (piece.toLowerCase()) {
    case "mute": {
      await ASSETS.createMuted(msg);
      break;
    }
    // no default
  }
  // TODO: Do more assets.
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: [],
  permLevel: 3,
  botPerms: ["MANAGE_CHANNELS", "MANAGE_ROLES"],
  requiredFuncs: [],
  spam: false,
  mode: 2,
  cooldown: 150,
};

exports.help = {
  name: "assets",
  description: "Discover the context of a message.",
  usage: "<mute>",
  usageDelim: "",
  extendedHelp: "",
};
