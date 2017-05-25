const { resNoVoiceChannel } = require("./music.json");

/* eslint-disable no-throw-literal */
exports.run = async (client, msg) => {
  const voiceChannel = msg.member.voiceChannel;
  if (!voiceChannel || voiceChannel.type !== "voice") await msg.send(resNoVoiceChannel[Math.floor(resNoVoiceChannel.length * Math.random())]);
  else {
    await voiceChannel.join();
    await msg.alert(`Successfully connected to ${voiceChannel}`);
  }
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: ["connect"],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 2,
  cooldown: 10,
  guilds: ["252480190654054410", "256566731684839428", "267337818202701824", "254360814063058944"],
};

exports.help = {
  name: "join",
  description: "Join a voice channel.",
  usage: "",
  usageDelim: "",
  extendedHelp: "",
};
