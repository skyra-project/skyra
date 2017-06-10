const managerMusic = require("../../utils/managerMusic");

const { resNoVoiceChannel } = managerMusic.config;

exports.run = async (client, msg) => {
  const voiceConnection = client.voice.connections.get(msg.guild.id);
  const voiceChannel = msg.guild.me.voiceChannel;

  if (voiceChannel) {
    await voiceChannel.leave();
    client.voice.connections.delete(msg.guild.id);
    managerMusic.delete(msg.guild.id);
    return msg.alert(`Successfully disconnected from ${voiceChannel}`);
  } else if (voiceConnection) {
    client.voice.connections.delete(msg.guild.id);
    managerMusic.delete(msg.guild.id);
    return msg.alert(`🛠 **DEBUG** | Successfully disconnected from ${voiceConnection.channel}`);
  }
  return msg.send(resNoVoiceChannel[Math.floor(resNoVoiceChannel.length * Math.random())]);
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
  name: "leave",
  description: "Leave a voice channel.",
  usage: "",
  usageDelim: "",
  extendedHelp: "",
};
