const managerMusic = require("../../utils/managerMusic");

exports.run = async (client, msg) => {
  if (!managerMusic.has(msg.guild.id)) throw "there's no queue.";
  if (managerMusic.toggleAutoPlay(msg.guild.id)) return msg.alert(`Dear ${msg.author}, YouTube AutoPlay has been enabled.`);
  return msg.alert(`Dear ${msg.author}, YouTube AutoPlay has been disabled.`);
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
  cooldown: 10,
  guilds: managerMusic.guilds,
};

exports.help = {
  name: "autoplay",
  description: "Enable/Disable the autoplayer.",
  usage: "",
  usageDelim: "",
  extendedHelp: "",
};
