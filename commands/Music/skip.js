const managerMusic = require("../../utils/managerMusic");

exports.run = async (client, msg) => {
    const response = await msg.send("⏭ Skipped");
    managerMusic.requiredVC(client, msg);
    managerMusic.get(msg.guild.id).skip(true);
    return response;
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
    name: "skip",
    description: "Skip the current song.",
    usage: "",
    usageDelim: "",
    extendedHelp: "",
};
