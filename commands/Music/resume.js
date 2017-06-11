const managerMusic = require("../../utils/managerMusic");

exports.run = async (client, msg) => {
  try {
    managerMusic.requiredVC(client, msg);
  } catch (e) {
    return msg.send(e);
  }
  const { dispatcher } = managerMusic.get(msg.guild.id);
  dispatcher.resume();
  return msg.send("▶ Resumed");
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
  cooldown: 10,
  guilds: managerMusic.guilds,
};

exports.help = {
  name: "resume",
  description: "Resume the current song.",
  usage: "",
  usageDelim: "",
  extendedHelp: "",
};
