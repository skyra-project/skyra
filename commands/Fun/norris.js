const snekfetch = require("snekfetch");

exports.run = async (client, msg) => {
    const data = await snekfetch.get("https://api.chucknorris.io/jokes/random").then(d => JSON.parse(d.text));
    const embed = new client.methods.Embed()
        .setColor(msg.color)
        .setDescription(`📢 **Chuck Norris' fact:** *${data.value}*`);
    return msg.send({ embed });
};

exports.conf = {
    enabled: true,
    runIn: ["text", "dm", "group"],
    aliases: ["chucknorris"],
    permLevel: 0,
    botPerms: [],
    requiredFuncs: [],
    spam: true,
    mode: 0,
    cooldown: 10,
};

exports.help = {
    name: "norris",
    description: "Read the ~~most popular~~ funniest phrases from Chuck Norris.",
    usage: "",
    usageDelim: "",
    extendedHelp: [
        "What does Chuck Norris say?",
        "",
        "Examples:",
        "&norris",
        "❯❯ When Chuck Norris opened his mouth he made dodo birds extinct. (random)",
    ].join("\n"),
};
