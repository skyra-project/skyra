const { Command, Constants: { oneToTen, basicAuth, httpResponses }, config } = require('../../index');
const { fromString } = require('html-to-text');
const { MessageEmbed } = require('discord.js');

const options = { headers: { Authorization: basicAuth(config.tokens.animelist.user, config.tokens.animelist.password) } };

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
        super(...args, {
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

        const i18n = msg.language;
        const [tType, tScore, tStatus, tWatchIt] = i18n.get('COMMAND_ANIME_TITLES');

        const embed = new MessageEmbed()
            .setColor(oneToTen(score).color)
            .setAuthor(...this.getAuthor(msg, entry, i18n))
            .setDescription(i18n.get('COMMAND_ANIME_DESCRIPTION', entry, context))
            .addField(tType, etype[entry.type.toString().toUpperCase()] || entry.type, true)
            .addField(tScore, `**${entry.score}** / 10 ${oneToTen(score).emoji}`, true)
            .addField(tStatus, i18n.get('COMMAND_ANIME_STATUS', entry))
            .addField(tWatchIt, `**[https://myanimelist.net/anime/${entry.id}](https://myanimelist.net/anime/${entry.id})**`)
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
            i18n.get('COMMAND_ANIME_TITLE', entry),
            entry.image && entry.image.length > 0 ? entry.image[0] : msg.author.displayAvatarURL({ size: 128 })
        ];
    }

};
