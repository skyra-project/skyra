const { fromString } = require("html-to-text");
const constants = require("../../utils/constants");

/* Autentification */
const { user, password } = constants.getConfig.tokens.animelist;
const Authorization = constants.basicAuth(user, password);

const etype = {
    MANGA: "📘 Manga",
    NOVEL: "📕 Novel",
    MANHWA: "🇰🇷 Manhwa",
    "ONE-SHOT": "☄ One Shot",
    SPECIAL: "🎴 Special",
};

exports.run = async (client, msg, [args]) => {
    const url = `https://myanimelist.net/api/manga/search.xml?q=${encodeURIComponent(args.toLowerCase())}`;
    const data = await client.funcs.fetch.XML(url, { headers: { Authorization } }).catch(() => { throw new Error(constants.httpResponses(404)); });
    const fres = data.manga.entry[0];
    const score = Math.ceil(parseFloat(fres.score));
    const context = fromString(fres.synopsis.toString());
    const embed = new client.methods.Embed()
    .setColor(constants.oneToTen(score).color)
    .setAuthor(`${fres.title} (${fres.episodes ? "unknown" : fres.chapters} chapters and ${fres.volumes ? "unknown" : fres.volumes} volumes)`, `${fres.image || msg.author.displayAvatarURL({ size: 128 })}`)
    .setDescription([
        `**English title:** ${fres.english}\n`,
        `${context.length > 750 ? `${client.funcs.splitText(context, 750)}... [continue reading](https://myanimelist.net/manga/${fres.id})` : context}`,
    ].join("\n"))
    .addField("Type", etype[fres.type.toString().toUpperCase()] || fres.type, true)
    .addField("Score", `**${fres.score}** / 10 ${constants.oneToTen(score).emoji}\u200B`, true)
    .addField("Status", [
        `\u200B  ❯  Current status: **${fres.status}**`,
        `\u200B    • Started: **${fres.start_date}**\n${fres.end_date === "0000-00-00" ? "" : `\u200B    • Finished: **${fres.end_date}**`}`,
    ].join("\n"))
    .addField("Watch it here:", `**[https://myanimelist.net/manga/${fres.id}](https://myanimelist.net/manga/${fres.id})**\u200B`)
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
    name: "manga",
    description: "Search your favourite manga by title with this command.",
    usage: "<query:string>",
    usageDelim: "",
    extendedHelp: [
        "Hey! Do you want me to display info about a Manga?",
        "",
        "Usage:",
        "&manga <Manga>",
        "",
        "Usage",
        " ❯ Manga: Name of chosen Manga",
        "",
        "Examples:",
        "&manga Stone Ocean",
    ].join("\n"),
};
