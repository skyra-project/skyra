const managerMusic = require("../../utils/managerMusic");

const { resNoVoiceChannel } = managerMusic.config;

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
  botPerms: ["CONNECT"],
  requiredFuncs: [],
  spam: false,
  mode: 2,
  cooldown: 10,
  guilds: managerMusic.guilds,
};

exports.help = {
  name: "join",
  description: "Join a voice channel.",
  usage: "",
  usageDelim: "",
  extendedHelp: "",
};
