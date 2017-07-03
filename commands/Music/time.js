const managerMusic = require("../../utils/managerMusic");
const moment = require("moment");

exports.run = async (client, msg) => {
    managerMusic.requiredVC(client, msg);
    const { dispatcher, queue, status } = managerMusic.get(msg.guild.id);
    if (status !== "playing") throw `I am not playing a song. Current status: \`${status}\``;
    return msg.send(`🕰 Time remaining: ${moment.duration((queue[0].seconds * 1000) - dispatcher.time).format("h[:]mm[:]ss")}`);
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
    name: "time",
    description: "Check when is the song going to end.",
    usage: "",
    usageDelim: "",
    extendedHelp: "",
};
