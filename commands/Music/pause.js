const managerMusic = require("../../utils/managerMusic");

exports.run = async (client, msg) => {
    managerMusic.requiredVC(client, msg);
    const musicInterface = managerMusic.get(msg.guild.id);
    if (musicInterface.status === "paused") throw "I already paused the song.";
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
