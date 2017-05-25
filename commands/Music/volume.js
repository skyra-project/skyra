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

exports.run = async (client, msg, [vol = null]) => {
  try {
    const song = await this.requiredVC(client, msg);
    if (!vol) {
      await msg.send(`📢 Volume: ${Math.round(song.dispatcher.volume * 50)}%`);
    } else if (/^[+]+$/.test(vol)) {
      if (Math.round(song.dispatcher.volume * 50) >= 100) await msg.send(`📢 Volume: ${Math.round(song.dispatcher.volume * 50)}%`);
      else {
        song.dispatcher.setVolume(Math.min(((song.dispatcher.volume * 50) + (2 * (vol.split("+").length - 1))) / 50, 2));
        await msg.send(`${song.dispatcher.volume === 2 ? "📢" : "🔊"} Volume: ${Math.round(song.dispatcher.volume * 50)}%`);
      }
    } else if (/^[-]+$/.test(vol)) {
      if (Math.round(song.dispatcher.volume * 50) <= 0) await msg.send(`🔇 Volume: ${Math.round(song.dispatcher.volume * 50)}%`);
      else {
        song.dispatcher.setVolume(Math.max(((song.dispatcher.volume * 50) - (2 * (vol.split("-").length - 1))) / 50, 0));
        await msg.send(`${song.dispatcher.volume === 0 ? "🔇" : "🔉"} Volume: ${Math.round(song.dispatcher.volume * 50)}%`);
      }
    } else {
      throw "Uhm? This is not how you use the volume command.";
    }
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
  name: "volume",
  description: "Pause the current song.",
  usage: "[control:str]",
  usageDelim: "",
  extendedHelp: "",
};
