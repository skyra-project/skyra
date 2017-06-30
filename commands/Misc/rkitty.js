const rand = [
    "77227", "60575", "202462", "164687", "344049", "112786", "103656",
    "384799", "207142", "73164", "42265", "60578", "94171", "78621",
    "138232", "60533", "73165", "54706", "32208", "25687", "20627",
    "64954", "136661", "340024", "447939", "457236", "426098", "180398",
    "313993", "230590", "100241", "54708", "306710", "32510", "344001",
];

let index = Math.ceil(Math.random() * rand.length);

exports.run = async (client, msg) => {
    if (index === rand.length - 1) index = 0;
    else index += 1;

    const embed = new client.methods.Embed()
    .setColor(msg.color)
    .setImage(`https://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-${rand[index]}.jpg`);
    return msg.send({ embed });
};

exports.conf = {
    enabled: true,
    runIn: ["text", "dm", "group"],
    aliases: ["kitten"],
    permLevel: 0,
    botPerms: [],
    requiredFuncs: [],
    spam: true,
    mode: 0,
    cooldown: 30,
};

exports.help = {
    name: "kitty",
    description: "Check this kitten! ❤",
    usage: "",
    usageDelim: "",
    extendedHelp: [
        "Aww, have you seen this kitten? It's so cute!",
        "",
        "Examples:",
        "",
        "&kitten",
        "❯❯ And I send you a super cute kitten! ❤",
    ].join("\n"),
};
