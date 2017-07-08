const ytdl = require("ytdl-core");
const getInfo = require("util").promisify(ytdl.getInfo);
const managerMusic = require("../../utils/managerMusic");

const delayer = () => new Promise(res => setTimeout(() => res(), 300));

const getLink = (arr) => {
    const output = arr.find(v => v.id);
    return `https://youtu.be/${output.id}`;
};

const autoPlayer = async (musicInterface) => {
    const info = await getInfo(musicInterface.next);
    musicInterface.queue.push({
        url: musicInterface.next,
        title: info.title,
        requester: "YouTube AutoPlay",
        loudness: info.loudness,
        seconds: info.length_seconds,
    });
    musicInterface.next = getLink(info.related_videos);
};

const play = async (musicInterface) => {
    if (!musicInterface.queue || !musicInterface.channel) {
        return musicInterface.destroy();
    }

    const song = musicInterface.queue[0];

    if (!song) {
        if (musicInterface.autoplay) return autoPlayer(musicInterface).then(() => play(musicInterface));
        return musicInterface.channel.send("⏹ Queue is empty").then(() => musicInterface.destroy());
    }
    await musicInterface.channel.send(`🎧 Playing: **${song.title}** as requested by: **${song.requester}**`);
    await delayer();

    return musicInterface.play()
        .then(dispatcher => dispatcher
            .on("end", () => {
                musicInterface.skip();
                play(musicInterface);
            })
            .on("error", (err) => {
                musicInterface.channel.send("Something very weird happened! Sorry for the incovenience :(");
                musicInterface.client.emit("log", err, "error");
                musicInterface.skip();
                play(musicInterface);
            }),
        )
        .catch((message) => {
            musicInterface.channel.send(message);
            musicInterface.destroy();
        });
};

exports.run = async (client, msg) => {
    const musicInterface = managerMusic.get(msg.guild.id);
    if (!musicInterface || musicInterface.queue.length === 0) {
        return msg.send(`Add some songs to the queue first with ${msg.guildSettings.prefix}add`);
    }
    if (!musicInterface.voiceChannel) {
        return client.commands.get("join").run(client, msg).then(() => this.run(client, msg));
    }
    if (musicInterface.status === "paused") {
        return client.commands.get("resume").run(client, msg);
    }
    if (musicInterface.status === "playing") {
        return msg.send("Already Playing");
    }
    musicInterface.status = "playing";
    musicInterface.channel = msg.channel;
    return play(musicInterface);
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
    usage: "",
    usageDelim: "",
    extendedHelp: "",
};
