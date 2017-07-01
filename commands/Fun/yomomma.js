const snekfetch = require("snekfetch");

exports.run = async (client, msg) => {
    const data = await snekfetch.get("http://api.yomomma.info/").then(d => JSON.parse(d.text));
    const embed = new client.methods.Embed()
        .setColor(msg.color)
        .setDescription(`📢 **Yomomma joke:** *${data.joke}*`);
    return msg.send({ embed });
};

exports.conf = {
    enabled: true,
    runIn: ["text", "dm", "group"],
    aliases: ["yomama", "yomomma"],
    permLevel: 0,
    botPerms: [],
    requiredFuncs: [],
    spam: true,
    mode: 0,
    cooldown: 10,
};

exports.help = {
    name: "yomomma",
    description: "Yo momma is so fat, yo.",
    usage: "",
    usageDelim: "",
    extendedHelp: [
        "Ok, this command can be a bit offensive, but it's funny for some people.",
        "",
        "Examples:",
        "&yomomma",
        "❯❯ \" Yo mama so fat when she stepped on a scale Buzz Lightyear came out and said infinity and beyond! \" (random)",
    ].join("\n"),
};
