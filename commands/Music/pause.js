const managerMusic = require("../../utils/managerMusic");

exports.run = async (client, msg) => {
    try {
        managerMusic.requiredVC(client, msg);
    } catch (e) {
        return msg.send(e);
    }
    managerMusic.get(msg.guild.id).pause();
    return msg.send("⏸ Paused");
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
    name: "pause",
    description: "Pause the current song.",
    usage: "",
    usageDelim: "",
    extendedHelp: "",
};
