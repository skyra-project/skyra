const managerMusic = require("../../utils/managerMusic");

exports.run = async (client, msg, [vol = false]) => {
    try {
        managerMusic.requiredVC(client, msg);
    } catch (e) {
        return msg.send(e);
    }
    const { dispatcher } = managerMusic.get(msg.guild.id);
    if (!vol) return msg.send(`📢 Volume: ${Math.round(dispatcher.volume * 50)}%`);
    if (/^[+]+$/.test(vol)) {
        if (Math.round(dispatcher.volume * 50) >= 100) return msg.send(`📢 Volume: ${Math.round(dispatcher.volume * 50)}%`);
        dispatcher.setVolume(Math.min(((dispatcher.volume * 50) + (2 * (vol.split("+").length - 1))) / 50, 2));
        return msg.send(`${dispatcher.volume === 2 ? "📢" : "🔊"} Volume: ${Math.round(dispatcher.volume * 50)}%`);
    }
    if (/^[-]+$/.test(vol)) {
        if (Math.round(dispatcher.volume * 50) <= 0) return msg.send(`🔇 Volume: ${Math.round(dispatcher.volume * 50)}%`);
        dispatcher.setVolume(Math.max(((dispatcher.volume * 50) - (2 * (vol.split("-").length - 1))) / 50, 0));
        return msg.send(`${dispatcher.volume === 0 ? "🔇" : "🔉"} Volume: ${Math.round(dispatcher.volume * 50)}%`);
    }
    throw "this is not how you use the volume command...";
};

exports.conf = {
    enabled: true,
    runIn: ["text"],
    aliases: ["vol"],
    permLevel: 0,
    botPerms: [],
    requiredFuncs: [],
    spam: false,
    mode: 2,
    cooldown: 10,
    guilds: managerMusic.guilds,
};

exports.help = {
    name: "volume",
    description: "Manage the volume for current song.",
    usage: "[control:string]",
    usageDelim: "",
    extendedHelp: [
        "Let's break it down!",
        "",
        "Listen carefully, you use this command by doing either 'volume ++++' or 'volume ----'.",
        "The more '+' you write, the more the volume will increment.",
        "The more '-' you write, the more the volume will decrease.",
        "",
        "👌",
    ].join("\n"),
};
