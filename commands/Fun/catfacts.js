const snekfetch = require("snekfetch");

exports.run = async (client, msg) => {
    const data = await snekfetch.get("http://catfacts-api.appspot.com/api/facts?number=1").then(d => JSON.parse(d.text));
    const embed = new client.methods.Embed()
        .setColor(msg.color)
        .setDescription(`📢 **Catfact:** *${data.facts[0]}*`);
    return msg.send({ embed });
};

exports.conf = {
    enabled: true,
    runIn: ["text", "dm", "group"],
    aliases: ["catfact", "kittenfact"],
    permLevel: 0,
    botPerms: [],
    requiredFuncs: [],
    spam: true,
    mode: 0,
    cooldown: 10,
};

exports.help = {
    name: "catfacts",
    description: "Let me tell you a misterious cat fact.",
    usage: "",
    usageDelim: "",
    extendedHelp: [
        "Do you know something misterious? Kittens!",
        "",
        "Examples:",
        "&catfact",
        "❯❯ \" The color of the points in Siamese cats is heat related. Cool areas are darker. \" (random)",
    ].join("\n"),
};
