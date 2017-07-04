const managerMusic = require("../../utils/managerMusic");

const shouldSkip = (total, size) => {
    switch (total) {
        case 1:
        case 2:
        case 3:
            return true;
        default:
            return size >= total * 0.4;
    }
};

const handleSkips = (musicInterface) => {
    if (!musicInterface.queue[0].skips) musicInterface.queue[0].skips = [];
    const members = musicInterface.voiceChannel.members.size - 1;
    return shouldSkip(members, musicInterface.queue[0].skips.length);
};

exports.run = async (client, msg, [force]) => {
    const response = await msg.send("⏭ Skipped");
    managerMusic.requiredVC(client, msg);
    const musicInterface = managerMusic.get(msg.guild.id);
    if (musicInterface.voiceChannel.members.size > 4) {
        if (force && !msg.hasLevel(1)) throw "You can't execute this command with the force flag. You must be at least a Staff member.";
        if (!handleSkips(musicInterface)) return msg.send("There are not enough votes.");
    }
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
    usage: "[-force]",
    usageDelim: "",
    extendedHelp: "",
};
