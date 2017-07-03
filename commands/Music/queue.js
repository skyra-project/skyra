const managerMusic = require("../../utils/managerMusic");
const moment = require("moment");

exports.run = async (client, msg) => {
    managerMusic.requiredVC(client, msg);
    const { queue, autoplay, next } = managerMusic.get(msg.guild.id);
    const output = queue.map(song =>
        `**TITLE**: ${song.title}\n` +
        `**URL**: <${song.url}> (${moment.duration(song.seconds * 1000).format("h[:]mm[:]ss")})\n` +
        `**REQUESTER**: ${song.requester.tag || song.requester}\n`,
    );
    if (autoplay) output.push(`\n**AutoPlay**: <${next}>`);
    return msg.send(output.join(`\n\\🎵${"―".repeat(10)}\\🎵\n`));
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
    name: "queue",
    description: "Displays the music queue.",
    usage: "",
    usageDelim: "",
    extendedHelp: "",
};
