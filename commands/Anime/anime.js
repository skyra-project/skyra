const { Command, Constants: { oneToTen, basicAuth, getConfig, httpResponses }, Discord: { Embed } } = require("../../index");
const splitText = require("../../functions/splitText");
const fetch = require("../../functions/fetch");
const { fromString } = require("html-to-text");

const options = {
    headers: {
        Authorization: basicAuth(getConfig.tokens.animelist.user, getConfig.tokens.animelist.password),
    },
};

const etype = {
    TV: "📺 TV",
    MOVIE: "🎥 Movie",
    OVA: "📼 Original Video Animation",
    SPECIAL: "🎴 Special",
};

const getURL = input => `https://myanimelist.net/api/anime/search.xml?q=${input}`;

/* eslint-disable class-methods-use-this */
module.exports = class Anime extends Command {

    constructor(...args) {
        super(...args, "anime", {
            botPerms: ["EMBED_LINKS"],

            usage: "<query:string>",
            description: "Search your favourite anime by title with this command.",
            extendedHelp: Command.strip`
                Hey! Do you want to check the info of your favourite anime?

                = Usage =
                Skyra, anime <Query>
                Query :: The anime's name you are looking for.

                = Example =
                Skyra, anime One Piece
            `,
        });
    }

    async run(msg, [args]) {
        const url = getURL(encodeURIComponent(args.toLowerCase()));
        const data = await fetch.XML(url, options).catch(() => { throw httpResponses(404); });
        const fres = data.anime.entry[0];
        const context = fromString(fres.synopsis.toString());
        const score = Math.ceil(parseFloat(fres.score));
        const embed = new Embed()
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
    }

};
