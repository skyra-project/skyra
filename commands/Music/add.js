const managerMusic = require("../../utils/managerMusic");
const snekfetch = require("snekfetch");

const getInfoAsync = require("util").promisify(require("ytdl-core").getInfo);
const { getConfig } = require("../../utils/constants");

exports.getLink = (arr) => {
    const output = arr.find(v => v.id);
    return `https://youtu.be/${output.id}`;
};

exports.getYouTube = async (client, msg, url) => {
    const info = await getInfoAsync(url).catch((err) => {
        client.emit("log", err, "error");
        throw `something happened with YouTube URL: ${url}\n${"```"}${err}${"```"}`;
    });
    // if (parseInt(info.length_seconds) > 600 && msg.member.voiceChannel.members.size >= 4) {
    //     throw "this song is too long, please add songs that last less than 10 minutes.";
    // }
    const musicInterface = managerMusic.get(msg.guild.id) || managerMusic.create(msg.guild);
    musicInterface.queue.push({
        url,
        title: info.title,
        requester: msg.author,
        loudness: info.loudness,
        seconds: parseInt(info.length_seconds),
    });
    musicInterface.next = this.getLink(info.related_videos);
    return info;
};

const { google } = getConfig.tokens;

const fetchURL = url => snekfetch.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${url}&key=${google}`).then(d => JSON.parse(d.text));

exports.findYoutube = async (client, msg, url) => {
    if (url.startsWith("https://www.youtube.com/watch?v=") || url.startsWith("https://youtu.be/")) {
        return this.getYouTube(client, msg, url);
    }
    const data = await fetchURL(encodeURIComponent(url));
    const video = data.items.find(item => item.id.kind !== "youtube#channel");
    return this.getYouTube(client, msg, `https://youtu.be/${video.id.videoId}`);
};

exports.run = async (client, msg, [song]) => {
    const info = await this.findYoutube(client, msg, song);
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
