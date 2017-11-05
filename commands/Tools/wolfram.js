/* eslint-disable */
const { structures: { Command }, config } = require('../../index');
const { MessageEmbed } = require('discord.js');

const parseString = require('util').promisify(require('xml2js').parseString);
const snekie = require('snekfetch');

const getURL = input => `https://api.wolframalpha.com/v2/query?input=${input}&appid=${config.tokens.wolfram}`;

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            botPerms: ['EMBED_LINKS'],

            cooldown: 15,
            permLevel: 10,

            usage: '<query:string>',
            description: 'Answers the question that was asked with Wolfram.',
            extend: {
                ARGUMENTS: '<query>',
                EXP_USAGE: [
                    ['query', 'The question.']
                ],
                EXAMPLES: [
                    'Secret of Life'
                ]
            }
        });
    }

    async run(msg, [args], settings, i18n) {
        const url = getURL(encodeURIComponent(args.toLowerCase()));
        const data = await snekie.get(url).then(result => parseString(result.text));
    }

    parseString(string) {
        return string.replace(/\${[^}]+}/g, match => `%${match.slice(2, match.length - 1).toUpperCase()}%`);
    }

};
