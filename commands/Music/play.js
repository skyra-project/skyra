/* eslint-disable no-throw-literal, consistent-return */
const { promisifyAll } = require("tsubaki");
const ytdl = promisifyAll(require("ytdl-core"));

const delayer = () => new Promise(res => setTimeout(() => res(), 300));

const getLink = (arr) => {
  const output = arr.find(v => v.id);
  return `https://youtu.be/${output.id}`;
};

const autoPlayer = async (client, queue) => {
  const info = await ytdl.getInfoAsync(queue.next);
  queue.songs.push({
    url: queue.next,
    title: info.title,
    requester: "YouTube AutoPlay",
    loudness: info.loudness,
    seconds: info.length_seconds,
  });
  queue.next = getLink(info.related_videos);
};

const play = async (client, guild) => {
  const queue = client.queue[guild.id];
  if (!queue) return;
  const channel = queue.channel;
  const song = queue.songs[0];

  if (!song) {
    if (queue.autoPlay) return autoPlayer(client, queue).then(() => play(client, guild));
    return channel.send("⏹ Queue is empty").then(() => {
      delete client.queue[guild.id];
      if (guild.me.voiceChannel) guild.me.voiceChannel.leave();
    });
  }
  queue.lastSong = song.url;
  await channel.send(`🎧 Playing: **${song.title}** as requested by: **${song.requester}**`);
  await delayer();
  const stream = ytdl(song.url, { audioonly: true }).on("error", err => channel.send(err));

  const dispatcher = queue.voiceConnection.playStream(stream, { passes: 5 })
    .on("end", () => this.skip(client, queue, guild))
    .on("error", err => channel.send(err).then(() => this.skip(client, queue, guild)));

  song.dispatcher = dispatcher;

  return undefined;
};

exports.skip = (client, queue, guild) => {
  queue.songs.shift();
  play(client, guild);
};

exports.run = async (client, msg, [req = null]) => {
  if (req) return client.commands.get("add").run(client, msg, [req]);
  const prefix = msg.guild.configs.prefix;
  if (!client.queue[msg.guild.id]) return msg.send(`Add some songs to the queue first with ${prefix}add`);
  if (!msg.guild.voiceConnection) return client.commands.get("join").run(client, msg).then(() => this.run(client, msg, [null]));
  if (client.queue[msg.guild.id].playing) return msg.send("Already Playing");
  client.queue[msg.guild.id].playing = true;
  client.queue[msg.guild.id].voiceConnection = msg.guild.voiceConnection;
  client.queue[msg.guild.id].channel = msg.channel;
  play(client, msg.guild);
};

exports.init = (client) => { if (!("queue" in client)) client.queue = {}; };

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: ["speak"],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 2,
  cooldown: 10,
  guilds: ["252480190654054410", "256566731684839428", "267337818202701824", "254360814063058944"],
};

exports.help = {
  name: "play",
  description: "Plays the queue, or add a song to the queue.",
  usage: "[song:str]",
  usageDelim: "",
  extendedHelp: "",
};
