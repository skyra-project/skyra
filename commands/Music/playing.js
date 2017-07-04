const managerMusic = require("../../utils/managerMusic");
const getInfo = require("util").promisify(require("ytdl-core").getInfo);
const moment = require("moment");

const seconds = time => moment.duration(time).format("h[:]mm[:]ss");

exports.run = async (client, msg) => {
    managerMusic.requiredVC(client, msg);
    const { dispatcher, queue, status } = managerMusic.get(msg.guild.id);
    if (status !== "playing") throw `I am not playing a song. Current status: \`${status}\``;
    const song = queue[0];
    const info = getInfo(song.url).catch((err) => { throw err; });
    const embed = new client.methods.Embed()
        .setColor(12916736)
        .setTitle(info.title)
        .setURL(`https://youtu.be/${info.vid}`)
        .setAuthor(info.author.name, info.author.avatar, info.author.channel_url)
        .setDescription(
            `**Duration**: ${seconds(parseInt(info.length_seconds) * 1000)} [${seconds((parseInt(info.length_seconds) * 1000) - dispatcher.time)}]\n\n` +
            `**Description**: ${info.description}`,
        )
        .setThumbnail(info.thumbnail_url)
        .setTimestamp();
    return msg.send({ embed });
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
    name: "playing",
    description: "Check when is the song going to end.",
    usage: "",
    usageDelim: "",
    extendedHelp: "",
};
