const { Command, Constants: { httpResponses }, Discord: { Embed } } = require('../../index');
const splitText = require('../../functions/splitText');
const snekfetch = require('snekfetch');

const baseURL = 'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&indexpageids=1&redirects=1&explaintext=1&exsectionformat=plain&titles=';

/* eslint-disable class-methods-use-this */
module.exports = class WikiPedia extends Command {

    constructor(...args) {
        super(...args, 'wikipedia', {
            aliases: ['wiki'],
            botPerms: ['EMBED_LINKS'],
            mode: 1,

            usage: '<query:string>',
            description: 'Search something throught Wikipedia.'
        });
    }

    async run(msg, [input]) {
        input = this.parseURL(input);
        const text = await snekfetch.get(baseURL + input).then(data => JSON.parse(data.text)).catch(Command.handleError);
        if (text.query.pageids[0] === '-1') throw httpResponses(404);
        const url = `https://en.wikipedia.org/wiki/${input}`;
        const content = text.query.pages[text.query.pageids[0]];
        const definition = this.content(content.extract, url);

        const embed = new Embed()
            .setTitle(content.title)
            .setURL(url)
            .setColor(0x05C9E8)
            .setThumbnail('https://en.wikipedia.org/static/images/project-logos/enwiki.png')
            .setDescription(`**Description**:\n${definition.replace(/\n{2,}/g, '\n').replace(/\s{2,}/g, ' ')}`)
            .setFooter('© Wikipedia - Creative Commons Attribution-ShareAlike 3.0');

        return msg.send({ embed });
    }

    parseURL(url) {
        return encodeURIComponent(
            url
                .toLowerCase()
                .replace(/[ ]/g, '_')
                .replace(/\(/g, '%28')
                .replace(/\)/g, '%29'),
        );
    }

    content(definition, url) {
        if (definition.length < 750) return definition;
        return `${splitText(definition, 750)}... [continue reading](${url})`;
    }

};
