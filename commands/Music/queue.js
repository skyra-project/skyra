const managerMusic = require("../../utils/managerMusic");
const moment = require("moment");

exports.run = async (client, msg) => {
    managerMusic.requiredVC(client, msg);
    const { queue, autoplay, next } = managerMusic.get(msg.guild.id);
    const output = [];
    for (let i = 0; i < Math.min(queue.length, 10); i++) {
        output[i] = `**TITLE**: ${queue[i].title}\n` +
        `**URL**: <${queue[i].url}> (${moment.duration(queue[i].seconds * 1000).format("h[:]mm[:]ss")})\n` +
        `**REQUESTER**: ${queue[i].requester.tag || queue[i].requester}`;
    }
    if (queue.length > 10) output.push(`\nShowing 10 songs of ${queue.length}`);
    else if (autoplay) output.push(`\n**AutoPlay**: <${next}>`);

    return msg.send(output.join(`\n\\🎵${"=".repeat(10)}\\🎵\n`));
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
