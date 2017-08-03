const { Command, Constants: { oneToTen, basicAuth, getConfig, httpResponses }, Discord: { Embed } } = require('../../index');
const splitText = require('../../functions/splitText');
const { fromString } = require('html-to-text');

const options = { headers: { Authorization: basicAuth(getConfig.tokens.animelist.user, getConfig.tokens.animelist.password) } };

const etype = {
    TV: '📺 TV',
    MOVIE: '🎥 Movie',
    OVA: '📼 Original Video Animation',
    SPECIAL: '🎴 Special'
};

const parseString = require('util').promisify(require('xml2js').parseString);
const Snekfetch = require('snekfetch');

const getURL = input => `https://myanimelist.net/api/anime/search.xml?q=${input}`;

/* eslint-disable class-methods-use-this */
module.exports = class extends Command {

    constructor(...args) {
        super(...args, 'anime', {
            botPerms: ['EMBED_LINKS'],

            usage: '<query:string>',
            description: 'Search your favourite anime by title with this command.',
            extendedHelp: Command.strip`
                Hey! Do you want to check the info of your favourite anime?

                = Usage =
                Skyra, anime <Query>
                Query :: The anime's name you are looking for.

                = Example =
                Skyra, anime One Piece
            `
        });
    }

    async run(msg, [args]) {
        const url = getURL(encodeURIComponent(args.toLowerCase()));
        const data = await this.fetch(url);
        const entry = data.anime.entry[0];
        const context = fromString(entry.synopsis.toString());
        const score = Math.ceil(parseFloat(entry.score));
        const embed = new Embed()
            .setColor(oneToTen(score).color)
            .setAuthor(...this.getAuthor(msg, entry))
            .setDescription(
                `**English title:** ${entry.english}\n` +
                `${context.length > 750 ? `${splitText(context, 750)}... [continue reading](https://myanimelist.net/anime/${entry.id})` : context}`,
            )
            .addField('Type', etype[entry.type.toString().toUpperCase()] || entry.type, true)
            .addField('Score', `**${entry.score}** / 10 ${oneToTen(score).emoji}`, true)
            .addField('Status',
                `  ❯  Current status: **${entry.status}**\n` +
                `    • Started: **${entry.start_date}**\n${entry.end_date === '0000-00-00' ? '' : `    • Finished: **${entry.end_date}**`}`,
            )
            .addField('Watch it here:', `**[https://myanimelist.net/anime/${entry.id}](https://myanimelist.net/anime/${entry.id})**`)
            .setFooter('© MyAnimeList');

        return msg.send({ embed });
    }

    fetch(url) {
        return new Snekfetch('GET', url, options)
            .then(data => parseString(data.text))
            .catch(() => { throw httpResponses(404); });
    }

    getAuthor(msg, entry) {
        return [
            `${entry.title} (${entry.episodes === 0 ? 'unknown' : entry.episodes} episodes)`,
            entry.image || msg.author.displayAvatarURL({ size: 128 })
        ];
    }

};
