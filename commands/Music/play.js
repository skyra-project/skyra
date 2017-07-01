const ytdl = require("ytdl-core");
const getInfo = require("util").promisify(ytdl.getInfo);
const managerMusic = require("../../utils/managerMusic");

const delayer = () => new Promise(res => setTimeout(() => res(), 300));

const getLink = (arr) => {
    const output = arr.find(v => v.id);
    return `https://youtu.be/${output.id}`;
};

const autoPlayer = async (guild, queue) => {
    const info = await getInfo(queue.next);
    managerMusic.queueAdd(guild.id, {
        url: queue.next,
        title: info.title,
        requester: "YouTube AutoPlay",
        loudness: info.loudness,
        seconds: info.length_seconds,
    });
    managerMusic.setNext(guild.id, getLink(info.related_videos));
};

/* eslint-disable consistent-return */
const play = async (client, guild) => {
    const queue = managerMusic.get(guild.id);
    if (!queue || queue.channel) {
        if (guild.me.voiceChannel) guild.me.voiceChannel.leave();
        return;
    }
    const channel = queue.channel;
    const song = queue.songs[0];

    if (!song) {
        if (queue.autoPlay) return autoPlayer(guild, queue).then(() => play(client, guild));
        return channel.send("⏹ Queue is empty").then(() => {
            managerMusic.delete(guild.id);
            if (guild.me.voiceChannel) guild.me.voiceChannel.leave();
        });
    }
    await channel.send(`🎧 Playing: **${song.title}** as requested by: **${song.requester}**`);
    await delayer();
    const stream = ytdl(song.url, { audioonly: true }).on("error", err => channel.send(err));

    const dispatcher = queue.voiceConnection.playStream(stream, { passes: 5 })
    .on("end", () => this.skip(client, guild))
    .on("error", err => channel.send(err).then(() => this.skip(client, guild)));

    managerMusic.setDispatcher(guild.id, dispatcher);

    return undefined;
};

exports.skip = (client, guild) => {
    managerMusic.skip(guild.id);
    play(client, guild);
};

exports.run = async (client, msg, [req = null]) => {
    if (req) return client.commands.get("add").run(client, msg, [req]);
    const queue = managerMusic.get(msg.guild.id);
    if (!queue) return msg.send(`Add some songs to the queue first with ${msg.guild.settings.prefix}add`);
    if (!msg.guild.voiceConnection) return client.commands.get("join").run(client, msg).then(() => this.run(client, msg, [null]));
    if (queue.playing) return msg.send("Already Playing");
    managerMusic.setPlaying(msg.guild.id, {
        voiceConnection: msg.guild.voiceConnection,
        channel: msg.channel,
    });
    return play(client, msg.guild);
};

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
    guilds: managerMusic.guilds,
};

exports.help = {
    name: "play",
    description: "Plays the queue, or add a song to the queue.",
    usage: "[song:string]",
    usageDelim: "",
    extendedHelp: "",
};
