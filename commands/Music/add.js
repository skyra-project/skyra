const managerMusic = require("../../utils/managerMusic");
const snekfetch = require("snekfetch");
const google = require("googleapis");

const playlist = require("util").promisify(google.youtube("v3").playlistItems.list);
const getInfoAsync = require("util").promisify(require("ytdl-core").getInfo);
const constants = require("../../utils/constants");

exports.getLink = (arr, played) => {
    const output = arr.find(v => v.id && !played.includes(`https://youtu.be/${v.id}`));
    if (!output) return null;
    return `https://youtu.be/${output.id}`;
};

exports.getYouTube = async (client, msg, url) => {
    const info = await getInfoAsync(url).catch((err) => {
        client.emit("log", err, "error");
        throw `something happened with YouTube URL: ${url}\n${"```"}${err}${"```"}`;
    });
    const musicInterface = managerMusic.get(msg.guild.id) || managerMusic.create(msg.guild);
    musicInterface.queue.push({
        url: `https://youtu.be/${info.video_id}`,
        title: info.title,
        requester: msg.author,
        loudness: info.loudness,
        seconds: parseInt(info.length_seconds),
    });
    musicInterface.next = this.getLink(info.related_videos, musicInterface.recentlyPlayed.filter(v => v));
    return info;
};

const key = constants.getConfig.tokens.google;

const fetchURL = url => snekfetch.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${url}&key=${key}`).then(d => JSON.parse(d.text));

exports.findYoutube = async (client, msg, url) => {
    if (/^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9-_]{11}.*/.test(url)) {
        url = `https://youtu.be/${/^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9-_]{11}).*/.exec(url)[1]}`;
        return this.getYouTube(client, msg, url);
    } else if (url === "playlist") {
        const userPlaylist = msg.author.profile.playlist;
        if (userPlaylist.length === 0) throw "you do not have a playlist.";
        const resolved = await Promise.all(userPlaylist.map(item => getInfoAsync(item).catch(() => false)));
        const musicInterface = managerMusic.get(msg.guild.id) || managerMusic.create(msg.guild);
        let amount = 0;
        for (let i = 0; i < userPlaylist.length; i++) {
            if (!resolved[i]) continue;
            amount++;
            musicInterface.queue.push({
                url: userPlaylist[i],
                title: resolved[i].title,
                requester: msg.author,
                loudness: resolved[i].loudness,
                seconds: parseInt(resolved[i].length_seconds),
            });
        }

        return { title: `${amount} songs` };
    } else if (/(https?:\/\/)?(www\.)?youtube\.com\/playlist\?list=/.test(url)) {
        const playlistId = url.replace(/(https?:\/\/)?(www\.)?youtube\.com\/playlist\?list=/, "");
        const { items } = await playlist({ playlistId, maxResults: 10, part: "contentDetails,snippet", auth: key }).catch((err) => { throw err; });
        const resolved = await Promise.all(items.map(item => getInfoAsync(`https://youtu.be/${item.contentDetails.videoId}`).catch(() => false)));
        const musicInterface = managerMusic.get(msg.guild.id) || managerMusic.create(msg.guild);
        let amount = 0;
        for (let i = 0; i < items.length; i++) {
            if (!resolved[i]) continue;
            amount++;
            musicInterface.queue.push({
                url: `https://youtu.be/${items[i].contentDetails.videoId}`,
                title: resolved[i].title,
                requester: msg.author,
                loudness: resolved[i].loudness,
                seconds: parseInt(resolved[i].length_seconds),
            });
        }

        return { title: `${amount} songs` };
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
    aliases: [],
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
