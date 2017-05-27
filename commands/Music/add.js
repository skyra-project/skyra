const { promisifyAll } = require("tsubaki");
const { getInfoAsync } = promisifyAll(require("ytdl-core"));

/* eslint-disable no-throw-literal, no-prototype-builtins */
exports.getLink = (arr) => {
  const output = arr.find(v => v.id);
  return `https://youtu.be/${output.id}`;
};

exports.getYouTube = async (client, msg, url) => {
  const info = await getInfoAsync(url).catch((e) => { throw `Something happened with YouTube URL: ${url}\n${e}`; });
  if (parseInt(info.length_seconds) > 600 && msg.member.voiceChannel.members.size >= 4) {
    throw "This song is too long, please add songs that last less than 10 minutes.";
  }
  if (!(msg.guild.id in client.queue)) {
    client.queue[msg.guild.id] = {};
    client.queue[msg.guild.id].playing = false;
    client.queue[msg.guild.id].songs = [];
  }
  client.queue[msg.guild.id].songs.push({
    url,
    title: info.title,
    requester: msg.author,
    loudness: info.loudness,
    seconds: parseInt(info.length_seconds),
  });
  client.queue[msg.guild.id].next = this.getLink(info.related_videos);
  return info;
};

exports.findYoutube = async (client, msg, url) => {
  if (url.startsWith("https://www.youtube.com/watch?v=") || url.startsWith("https://youtu.be/")) {
    return this.getYouTube(client, msg, url);
  }
  const { google } = client.constants.getConfig.tokens;
  const { data } = await client.fetch.JSON(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(url)}&key=${google}`);
  const video = data.items.find(item => item.id.kind !== "youtube#channel");
  return this.getYouTube(client, msg, `https://youtu.be/${video.id.videoId}`);
};

exports.run = async (client, msg, [song]) => {
  const info = await this.findYoutube(client, msg, song);
  msg.send(`🎵 Added **${info.title}** to the queue 🎶`);
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
  name: "add",
  description: "Adds a song the the queue.",
  usage: "<song:str>",
  usageDelim: "",
  extendedHelp: "",
};
