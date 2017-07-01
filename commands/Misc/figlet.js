const figletAsync = require("util").promisify(require("figlet"));

exports.run = (client, msg, [banner]) => figletAsync(banner)
    .then(data => msg.send(data, { code: true }));

exports.conf = {
    enabled: true,
    runIn: ["text", "dm", "group"],
    aliases: [],
    permLevel: 0,
    botPerms: [],
    requiredFuncs: [],
    spam: true,
    mode: 0,
    cooldown: 5,
};

exports.help = {
    name: "figlet",
    description: "Creates an ASCII banner from the string you supply",
    usage: "<banner:string>",
    usageDelim: "",
    extendedHelp: [
        "Usage",
        "&figlet <text>",
        "",
        " _   _ _",
        "| | | (_)",
        "| |_| | |",
        "|  _  | |",
        "|_| |_|_|",
    ].join("\n"),
};
