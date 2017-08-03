const { Command, Constants: { oneToTen, basicAuth, getConfig, httpResponses }, Discord: { Embed } } = require('../../index');
const splitText = require('../../functions/splitText');
const { fromString } = require('html-to-text');

const options = { headers: { Authorization: basicAuth(getConfig.tokens.animelist.user, getConfig.tokens.animelist.password) } };

const etype = {
    MANGA: '📘 Manga',
    NOVEL: '📕 Novel',
    MANHWA: '🇰🇷 Manhwa',
    'ONE-SHOT': '☄ One Shot',
    SPECIAL: '🎴 Special'
};

const parseString = require('util').promisify(require('xml2js').parseString);
const Snekfetch = require('snekfetch');

const getURL = input => `https://myanimelist.net/api/manga/search.xml?q=${input}`;

/* eslint-disable class-methods-use-this */
module.exports = class Manga extends Command {

    constructor(...args) {
        super(...args, 'manga', {
            botPerms: ['EMBED_LINKS'],

            usage: '<query:string>',
            description: 'Search your favourite manga by title with this command.',
            extendedHelp: Command.strip`
                Hey! Do you want to check the info of your favourite manga?

                = Usage =
                Skyra, manga <Query>
                Query :: The manga's name you are looking for.

                = Example =
                Skyra, anime Stone Ocean
            `
        });
    }

    async run(msg, [args]) {
        const url = getURL(encodeURIComponent(args.toLowerCase()));
        const data = await this.fetch(url, options);
        const entry = data.manga.entry[0];
        const score = Math.ceil(parseFloat(entry.score));
        const context = fromString(entry.synopsis.toString());
        const embed = new Embed()
            .setColor(oneToTen(score).color)
            .setAuthor(...this.getAuthor(msg, entry))
            .setDescription(
                `**English title:** ${entry.english}\n` +
                `${context.length > 750 ? `${splitText(context, 750)}... [continue reading](https://myanimelist.net/manga/${entry.id})` : context}`,
            )
            .addField('Type', etype[entry.type.toString().toUpperCase()] || entry.type, true)
            .addField('Score', `**${entry.score}** / 10 ${oneToTen(score).emoji}`, true)
            .addField('Status',
                `  ❯  Current status: **${entry.status}**\n` +
                `    • Started: **${entry.start_date}**\n${entry.end_date === '0000-00-00' ? '' : `    • Finished: **${entry.end_date}**`}`,
            )
            .addField('Watch it here:', `**[https://myanimelist.net/manga/${entry.id}](https://myanimelist.net/manga/${entry.id})**`)
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
            `${entry.title} (${entry.chapters ? 'unknown' : entry.chapters} chapters and ${entry.volumes ? 'unknown' : entry.volumes} volumes)`,
            entry.image || msg.author.displayAvatarURL({ size: 128 })
        ];
    }

};
