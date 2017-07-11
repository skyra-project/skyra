const Command = require("../../classes/command");
const { oneToTen, basicAuth, getConfig, httpResponses } = require("../../utils/constants");
const splitText = require("../../functions/splitText");
const fetch = require("../../functions/fetch");
const { fromString } = require("html-to-text");

const options = {
    headers: {
        Authorization: basicAuth(getConfig.tokens.animelist.user, getConfig.tokens.animelist.password),
    },
};

const etype = {
    MANGA: "📘 Manga",
    NOVEL: "📕 Novel",
    MANHWA: "🇰🇷 Manhwa",
    "ONE-SHOT": "☄ One Shot",
    SPECIAL: "🎴 Special",
};

const getURL = input => `https://myanimelist.net/api/manga/search.xml?q=${input}`;

/* eslint-disable class-methods-use-this */
module.exports = class Manga extends Command {

    constructor(...args) {
        super(...args, "manga", {
            botPerms: ["EMBED_LINKS"],

            usage: "<query:string>",
            description: "Search your favourite manga by title with this command.",
            extendedHelp: Command.strip`
                Hey! Do you want to check the info of your favourite manga?

                = Usage =
                Skyra, manga <Query>
                Query :: The manga's name you are looking for.

                = Example =
                Skyra, anime Stone Ocean
            `,
        });
    }

    async run(msg, [args]) {
        const url = getURL(encodeURIComponent(args.toLowerCase()));
        const data = await fetch.XML(url, options).catch(() => { throw httpResponses(404); });
        const fres = data.manga.entry[0];
        const score = Math.ceil(parseFloat(fres.score));
        const context = fromString(fres.synopsis.toString());
        const embed = new this.client.methods.Embed()
            .setColor(oneToTen(score).color)
            .setAuthor(`${fres.title} (${fres.episodes ? "unknown" : fres.chapters} chapters and ${fres.volumes ? "unknown" : fres.volumes} volumes)`, `${fres.image || msg.author.displayAvatarURL({ size: 128 })}`)
            .setDescription(
                `**English title:** ${fres.english}\n` +
                `${context.length > 750 ? `${splitText(context, 750)}... [continue reading](https://myanimelist.net/manga/${fres.id})` : context}`,
            )
            .addField("Type", etype[fres.type.toString().toUpperCase()] || fres.type, true)
            .addField("Score", `**${fres.score}** / 10 ${oneToTen(score).emoji}`, true)
            .addField("Status",
                `  ❯  Current status: **${fres.status}**\n` +
                `    • Started: **${fres.start_date}**\n${fres.end_date === "0000-00-00" ? "" : `    • Finished: **${fres.end_date}**`}`,
            )
            .addField("Watch it here:", `**[https://myanimelist.net/manga/${fres.id}](https://myanimelist.net/manga/${fres.id})**`)
            .setFooter("© MyAnimeList");

        return msg.send({ embed });
    }

};
