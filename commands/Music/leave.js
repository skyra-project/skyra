const { resNoVoiceChannel } = require("./music.json");

/* eslint-disable no-throw-literal */
exports.run = async (client, msg) => {
  const voiceConnection = client.voice.connections.get(msg.guild.id);
  const voiceChannel = msg.guild.me.voiceChannel;

  if (voiceChannel) {
    await voiceChannel.leave();
    client.voice.connections.delete(msg.guild.id);
    delete client.queue[msg.guild.id];
    await msg.alert(`Successfully disconnected from ${voiceChannel}`);
  } else if (voiceConnection) {
    client.voice.connections.delete(msg.guild.id);
    delete client.queue[msg.guild.id];
    await msg.alert(`🛠 **DEBUG** | Successfully disconnected from ${voiceConnection.channel}`);
  } else {
    await msg.send(resNoVoiceChannel[Math.floor(resNoVoiceChannel.length * Math.random())]);
  }
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
  guilds: ["252480190654054410", "256566731684839428", "267337818202701824", "254360814063058944"],
};

exports.help = {
  name: "leave",
  description: "Leave a voice channel.",
  usage: "",
  usageDelim: "",
  extendedHelp: "",
};
