const { Command, Constants: { oneToTen, basicAuth, httpResponses }, config } = require('../../index');
const { fromString } = require('html-to-text');
const { RichEmbed } = require('discord.js');

const options = { headers: { Authorization: basicAuth(config.tokens.animelist.user, config.tokens.animelist.password) } };

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

        const i18n = msg.language;
        const [tType, tScore, tStatus, tWatchIt] = i18n.get('COMMAND_ANIME_TITLES');

        const embed = new RichEmbed()
            .setColor(oneToTen(score).color)
            .setAuthor(...this.getAuthor(msg, entry, i18n))
            .setDescription(i18n.get('COMMAND_MANGA_DESCRIPTION', entry, context))
            .addField(tType, etype[entry.type.toString().toUpperCase()] || entry.type, true)
            .addField(tScore, `**${entry.score}** / 10 ${oneToTen(score).emoji}`, true)
            .addField(tStatus, i18n.get('COMMAND_MANGA_STATUS', entry))
            .addField(tWatchIt, `**[https://myanimelist.net/manga/${entry.id}](https://myanimelist.net/manga/${entry.id})**`)
            .setFooter('© MyAnimeList');

        return msg.send({ embed });
    }

    fetch(url) {
        return new Snekfetch('GET', url, options)
            .then(data => parseString(data.text))
            .catch(() => { throw httpResponses(404); });
    }

    getAuthor(msg, entry, i18n) {
        return [
            i18n.get('COMMAND_MANGA_TITLE', entry),
            entry.image || msg.author.displayAvatarURL({ size: 128 })
        ];
    }

};
