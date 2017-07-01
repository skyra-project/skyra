const { oneToTen, basicAuth, getConfig, httpResponses } = require("../../utils/constants");
const splitText = require("../../functions/splitText");
const fetch = require("../../functions/fetch");
const { fromString } = require("html-to-text");

const Authorization = basicAuth(getConfig.tokens.animelist.user, getConfig.tokens.animelist.password);

const etype = {
    TV: "📺 TV",
    MOVIE: "🎥 Movie",
    OVA: "📼 Original Video Animation",
    SPECIAL: "🎴 Special",
};

const getURL = input => `https://myanimelist.net/api/anime/search.xml?q=${input}`;

exports.run = async (client, msg, [args]) => {
    const url = getURL(encodeURIComponent(args.toLowerCase()));
    const data = await fetch.XML(url, { headers: { Authorization } }).catch(() => { throw httpResponses(404); });
    const fres = data.anime.entry[0];
    const context = fromString(fres.synopsis.toString());
    const score = Math.ceil(parseFloat(fres.score));
    const embed = new client.methods.Embed()
        .setColor(oneToTen(score).color)
        .setAuthor(`${fres.title} (${fres.episodes === 0 ? "unknown" : fres.episodes} eps)`, `${fres.image || msg.author.displayAvatarURL({ size: 128 })}`)
        .setDescription(
            `**English title:** ${fres.english}\n` +
            `${context.length > 750 ? `${splitText(context, 750)}... [continue reading](https://myanimelist.net/anime/${fres.id})` : context}`,
        )
        .addField("Type", etype[fres.type.toString().toUpperCase()] || fres.type, true)
        .addField("Score", `**${fres.score}** / 10 ${oneToTen(score).emoji}`, true)
        .addField("Status",
            `  ❯  Current status: **${fres.status}**\n` +
            `    • Started: **${fres.start_date}**\n${fres.end_date === "0000-00-00" ? "" : `    • Finished: **${fres.end_date}**`}`,
        )
        .addField("Watch it here:", `**[https://myanimelist.net/anime/${fres.id}](https://myanimelist.net/anime/${fres.id})**`)
        .setFooter("© MyAnimeList");

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
    name: "anime",
    description: "Search your favourite anime by title with this command.",
    usage: "<Anime:string>",
    usageDelim: "",
    extendedHelp: [
        "Hey! Do you want to check the info of an Anime?",
        "",
        "Usage:",
        "&anime <Anime>",
        "",
        "Usage",
        " ❯ Anime: name of chosen anime",
        "",
        "Examples:",
        "&anime Space Dandy",
    ].join("\n"),
};
