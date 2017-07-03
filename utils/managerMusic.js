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
    const musicInterface = this.get(msg.guild.id);
    if (!musicInterface) throw musicConfig.resNoQueue[Math.floor(musicConfig.resNoQueue.length * Math.random())];
    const song = musicInterface.queue[0];
    if (!song) throw musicConfig.resNoSong[Math.floor(musicConfig.resNoSong.length * Math.random())];
    const channel = musicInterface.voiceChannel;
    if (!channel.members.has(msg.author.id)) throw `Please, join ${channel}`;
    return song;
};

exports.config = musicConfig;

exports.guilds = ["252480190654054410", "256566731684839428", "267337818202701824", "254360814063058944"];
