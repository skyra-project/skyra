const { resNoQueue, resNoSong } = require("./music.json");

/* eslint-disable no-throw-literal */
exports.requiredVC = async (client, msg) => {
  const queue = client.queue[msg.guild.id];
  if (!queue) throw resNoQueue[Math.floor(resNoQueue.length * Math.random())];
  const song = queue.songs[0];
  if (!song) throw resNoSong[Math.floor(resNoSong.length * Math.random())];
  const channel = queue.voiceConnection.channel;
  if (!channel.members.has(msg.author.id)) throw `Please, join ${channel}`;
  return song;
};

exports.run = async (client, msg) => {
  try {
    const song = await this.requiredVC(client, msg);
    await msg.send("⏸ Paused");
    song.dispatcher.pause();
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
  requireVC: true,
  spam: false,
  mode: 2,
  cooldown: 10,
  guilds: ["252480190654054410", "256566731684839428", "267337818202701824", "254360814063058944"],
};

exports.help = {
  name: "pause",
  description: "Pause the current song.",
  usage: "",
  usageDelim: "",
  extendedHelp: "",
};
