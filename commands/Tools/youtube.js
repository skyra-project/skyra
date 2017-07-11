const { httpResponses, getConfig } = require("../../utils/constants");
const snekfetch = require("snekfetch");

const { google } = getConfig.tokens;
const getURL = input => snekfetch.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${input}&key=${google}`).then(d => JSON.parse(d.text));

exports.run = async (client, msg, [input, ind = 1]) => {
    const index = ind - 1;
    const data = await getURL(encodeURIComponent(input));
    const result = data.items[index];
    if (!result) throw httpResponses(404);
    const output = result.id.kind === "youtube#channel" ? `https://youtube.com/channel/${result.id.channelId}` : `https://youtu.be/${result.id.videoId}`;
    return msg.send(output);
};

exports.conf = {
    enabled: true,
    runIn: ["text", "dm", "group"],
    aliases: [],
    permLevel: 0,
    botPerms: [],
    requiredFuncs: [],
    spam: false,
    mode: 1,
    cooldown: 5,
};

exports.help = {
    name: "youtube",
    description: "Search something throught YouTube.",
    usage: "<query:string> [index:int]",
    usageDelim: " #",
    extendedHelp: [
        "Let's search some videos :p",
        "",
        "Usage:",
        "&youtube <query>",
        "",
        " ❯ Query: Search videos with keywords.",
        "",
        "Examples:",
        "&youtube Arc North - Never Gonna",
    ].join("\n"),
};
