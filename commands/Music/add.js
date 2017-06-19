const managerMusic = require("../../utils/managerMusic");

const getInfoAsync = require("util").promisify(require("ytdl-core").getInfo);
const constants = require("../../utils/constants");

exports.getLink = (arr) => {
  const output = arr.find(v => v.id);
  return `https://youtu.be/${output.id}`;
};

exports.getYouTube = async (client, msg, url) => {
  const info = await getInfoAsync(url).catch((e) => { throw `something happened with YouTube URL: ${url}\n${e}`; });
  if (parseInt(info.length_seconds) > 600 && msg.member.voiceChannel.members.size >= 4) {
    throw "this song is too long, please add songs that last less than 10 minutes.";
  }
  managerMusic.queueAdd(msg.guild.id, {
    url,
    title: info.title,
    requester: msg.author,
    loudness: info.loudness,
    seconds: parseInt(info.length_seconds),
  });
  managerMusic.setNext(msg.guild.id, this.getLink(info.related_videos));
  return info;
};

exports.findYoutube = async (client, msg, url) => {
  if (url.startsWith("https://www.youtube.com/watch?v=") || url.startsWith("https://youtu.be/")) {
    return this.getYouTube(client, msg, url);
  }
  const { google } = constants.getConfig.tokens;
  const data = await client.funcs.fetch.JSON(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(url)}&key=${google}`);
  const video = data.items.find(item => item.id.kind !== "youtube#channel");
  return this.getYouTube(client, msg, `https://youtu.be/${video.id.videoId}`);
};

exports.nuke = (client, msg) => {
  const { playing, nuke } = managerMusic.get(msg.guild.id);
  if (playing || nuke) return;
  managerMusic.autoNuke(msg.guild.id);
};

exports.run = async (client, msg, [song]) => {
  const info = await this.findYoutube(client, msg, song);
  this.nuke(client, msg);
  return msg.send(`🎵 Added **${info.title}** to the queue 🎶`);
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
  guilds: managerMusic.guilds,
};

exports.help = {
  name: "add",
  description: "Adds a song the the queue.",
  usage: "<song:string>",
  usageDelim: "",
  extendedHelp: "",
};
