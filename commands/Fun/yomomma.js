const snekfetch = require("snekfetch");

const fetchURL = url => snekfetch.get(url).then(d => JSON.parse(d.text));

exports.run = async (client, msg) => {
    const data = await fetchURL("http://api.yomomma.info/");
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
