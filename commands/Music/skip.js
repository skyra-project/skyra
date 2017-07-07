const managerMusic = require("../../utils/managerMusic");

const shouldInhibit = (total, size) => {
    switch (total) {
        case 1:
        case 2:
        case 3:
            return true;
        default:
            return size >= total * 0.4 ? false : `🔸 | Votes: ${size} of ${Math.ceil(total * 0.4)}`;
    }
};

const handleSkips = (musicInterface, user) => {
    if (!musicInterface.queue[0].skips) musicInterface.queue[0].skips = new Set();
    if (musicInterface.queue[0].skips.has(user)) return "You have already voted to skip this song.";
    musicInterface.queue[0].skips.add(user);
    const members = musicInterface.voiceChannel.members.size - 1;
    return shouldInhibit(members, musicInterface.queue[0].skips.size);
};

exports.run = async (client, msg, [force]) => {
    managerMusic.requiredVC(client, msg);
    const musicInterface = managerMusic.get(msg.guild.id);
    if (musicInterface.voiceChannel && musicInterface.voiceChannel.members.size > 4) {
        if (force) {
            if (!msg.hasLevel(1)) throw "You can't execute this command with the force flag. You must be at least a Staff member.";
        } else {
            const response = handleSkips(musicInterface, msg.author.id);
            if (response) return msg.send(response);
        }
    }
    await msg.send(`⏭ Skipped ${musicInterface.queue[0].title}`);
    musicInterface.skip(true);
    return null;
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
