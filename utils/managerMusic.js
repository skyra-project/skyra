const musicConfig = require("../music.json");
const { Collection } = require("discord.js");

const data = new Collection();

/* eslint-disable no-underscore-dangle */
exports.get = guild => data.get(guild);

exports.has = guild => data.has(guild);

exports.queueAdd = (guild, song) => {
  if (!this.has(guild)) data.set(guild, { playing: false, songs: [] });
  data.get(guild).songs.push(song);
};

exports.setNext = (guild, song) => { data.get(guild).next = song; };

exports.setDispatcher = (guild, dispatcher) => { data.get(guild).dispatcher = dispatcher; };

exports.skip = guild => data.get(guild).songs.shift();

exports.autoNuke = guild => setTimeout(() => data.delete(guild), 5 * 60 * 1000);

exports.destroyNuke = (guild) => {
  clearTimeout(data.get(guild).nuke);
  delete data.get(guild).nuke;
};

exports.setPlaying = (guild, { voiceConnection, channel }) => {
  const queue = data.get(guild);
  queue.playing = true;
  queue.voiceConnection = voiceConnection;
  queue.channel = channel;
  if (queue.nuke) this.destroyNuke(guild);
};

exports.toggleAutoPlay = (guild) => {
  const queue = data.get(guild);
  if (!queue) throw "There is no queue.";
  if (queue.autoPlay) {
    queue.autoPlay = false;
    return false;
  }
  queue.autoPlay = true;
  return true;
};

exports.delete = guild => data.delete(guild);

exports.fetchAll = () => data;

exports.requiredVC = (client, msg) => {
  const queue = this.get(msg.guild.id);
  if (!queue) throw musicConfig.resNoQueue[Math.floor(musicConfig.resNoQueue.length * Math.random())];
  const song = queue.songs[0];
  if (!song) throw musicConfig.resNoSong[Math.floor(musicConfig.resNoSong.length * Math.random())];
  const channel = queue.voiceConnection.channel;
  if (!channel.members.has(msg.author.id)) throw `Please, join ${channel}`;
  return song;
};

exports.config = musicConfig;

exports.guilds = ["252480190654054410", "256566731684839428", "267337818202701824", "254360814063058944"];
