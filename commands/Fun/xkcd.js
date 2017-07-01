const snekfetch = require("snekfetch");

exports.run = async (client, msg, [input]) => {
    let number;
    let num;
    let query;

    if (input) {
        if (!isNaN(parseInt(input))) num = parseInt(input);
        else if (typeof input === "string") query = input;
    }

    const xkcdInfo = await snekfetch.get("http://xkcd.com/info.0.json").then(d => JSON.parse(d.text));
    if (num) {
        if (num <= xkcdInfo.num) number = num;
        else return msg.send(`Dear ${msg.author}, there are only ${xkcdInfo.num} comics.`);
    } else if (query) {
        const searchQuery = await snekfetch.get(`https://relevantxkcd.appspot.com/process?action=xkcd&query=${query}`).then(d => JSON.parse(d.text));
        number = searchQuery.split(" ")[2].replace("\n", "");
    } else { number = Math.floor(Math.random() * (xkcdInfo.num - 1)) + 1; }

    const xkcdComic = await snekfetch.get(`http://xkcd.com/${number}/info.0.json`).then(d => JSON.parse(d.text));

    const embed = new client.methods.Embed()
        .setColor(msg.color)
        .setImage(xkcdComic.img)
        .setFooter(`XKCD | ${xkcdComic.num}`)
        .setDescription(xkcdComic.alt)
        .setTimestamp();
    return msg.send({ embed });
};

exports.conf = {
    enabled: true,
    runIn: ["text", "dm", "group"],
    aliases: [],
    permLevel: 0,
    botPerms: [],
    requiredFuncs: [],
    spam: false,
    mode: 1,
    cooldown: 10,
};

exports.help = {
    name: "xkcd",
    description: "Read comics from XKCD",
    usage: "[number:int|query:string]",
    usageDelim: "",
    extendedHelp: [
        "Should I wash the dishes? Or should I throw the dishes throught the window?",
        "",
        "Usage:",
        "&rng <text1>, <text2>, ...",
        "",
        "Examples:",
        "&rng Should Wash the dishes, Throw the dishes throught the window",
        "❯❯ \" Throw the dishes throught the window \" (random)",
    ].join("\n"),
};
