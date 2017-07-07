const managerMusic = require("../../utils/managerMusic");
const constants = require("../../utils/constants");
const google = require("googleapis");
const playlist = require("util").promisify(google.youtube("v3").playlistItems.list);
const getInfoAsync = require("util").promisify(require("ytdl-core").getInfo);

const key = constants.getConfig.tokens.google;

exports.run = async (client, msg, [input]) => {
    if (!managerMusic.has(msg.guild.id)) throw "there's no queue.";
    if (!/(https?:\/\/)?(www\.)?youtube\.com\/playlist\?list=/.test(input)) throw "You must insert a valid playlist URL.";
    const playlistId = input.replace(/(https?:\/\/)?(www\.)?youtube\.com\/playlist\?list=/, "");
    const { items } = await playlist({ playlistId, maxResults: 10, part: "contentDetails,snippet", auth: key }).catch((err) => { throw err; });
    const resolved = await Promise.all(items.map(item => getInfoAsync(`https://youtu.be/${item.contentDetails.videoId}`).catch(() => false)));
    const songs = [];
    for (let i = 0; i < items.length; i++) {
        if (!resolved[i]) continue;
        songs.push({
            url: `https://youtu.be/${items[i].contentDetails.videoId}`,
            title: resolved[i].title,
            requester: msg.author,
            loudness: resolved[i].loudness,
            seconds: parseInt(resolved[i].length_seconds),
        });
    }
    // client.emit("log", songs.join("\n\n"), "debug");
    return msg.send(`Successfully added ${songs.length} songs.`);
};

exports.conf = {
    enabled: true,
    runIn: ["text"],
    aliases: [],
    permLevel: 10,
    botPerms: [],
    requiredFuncs: [],
    spam: false,
    mode: 2,
    cooldown: 10,
    guilds: managerMusic.guilds,
};

exports.help = {
    name: "import",
    description: "Enable/Disable the autoplayer.",
    usage: "<url:url>",
    usageDelim: "",
    extendedHelp: "",
};
