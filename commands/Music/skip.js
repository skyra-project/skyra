const managerMusic = require("../../utils/managerMusic");

exports.run = async (client, msg) => {
  try {
    managerMusic.requiredVC(client, msg);
  } catch (e) {
    return msg.send(e);
  }
  const { dispatcher } = managerMusic.get(msg.guild.id);
  dispatcher.end();
  return msg.send("⏭ Skipped");
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
  name: "skip",
  description: "Skip the current song.",
  usage: "",
  usageDelim: "",
  extendedHelp: "",
};
