const musicConfig = require("../music.json");
const { Collection } = require("discord.js");
const MusicInterface = require("./interfaceMusic");

const data = new Collection();

/* eslint-disable no-underscore-dangle */
exports.get = guild => data.get(guild);

exports.has = guild => data.has(guild);

exports.create = (guild) => {
    const musicInterface = new MusicInterface(guild);
    data.set(guild.id, musicInterface);
    return musicInterface;
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
