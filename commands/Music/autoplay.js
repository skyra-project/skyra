/* eslint-disable no-throw-literal */
exports.run = async (client, msg) => {
  if (!(msg.guild.id in client.queue)) throw "There's no queue.";
  if (client.queue[msg.guild.id].autoPlay) {
    client.queue[msg.guild.id].autoPlay = false;
    await msg.alert(`Dear ${msg.author}, YouTube AutoPlay has been disabled.`);
  } else {
    client.queue[msg.guild.id].autoPlay = true;
    await msg.alert(`Dear ${msg.author}, YouTube AutoPlay has been enabled.`);
  }
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: [],
  permLevel: 1,
  botPerms: [],
  requiredFuncs: [],
  requireVC: true,
  spam: false,
  mode: 2,
  cooldown: 10,
  guilds: ["252480190654054410", "256566731684839428", "267337818202701824", "254360814063058944"],
};

exports.help = {
  name: "autoplay",
  description: "Enable/Disable the autoplayer.",
  usage: "",
  usageDelim: "",
  extendedHelp: "",
};
