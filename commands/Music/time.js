const managerMusic = require("../../utils/managerMusic");
const moment = require("moment");

exports.run = async (client, msg) => {
  try {
    managerMusic.requiredVC(client, msg);
    const song = managerMusic.get(msg.guild.id).songs[0];
    await msg.send(`🕰 Time remaining: ${moment.duration((song.seconds * 1000) - song.dispatcher.time).format("h[:]mm[:]ss")}`);
  } catch (e) {
    msg.send(e);
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
  cooldown: 10,
  guilds: managerMusic.guilds,
};

exports.help = {
  name: "time",
  description: "Check when is the song going to end.",
  usage: "",
  usageDelim: "",
  extendedHelp: "",
};
