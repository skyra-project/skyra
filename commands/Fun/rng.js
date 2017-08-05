const { Command } = require('../../index');

/* eslint-disable class-methods-use-this */
module.exports = class extends Command {

    constructor(...args) {
        super(...args, 'rng', {
            aliases: ['choice'],
            spam: true,

            usage: '<words:string> [...]',
            usageDelim: ', ',
            description: 'Eeny, meeny, miny, moe, catch a tiger by the toe...',
            extendedHelp: Command.strip`
                Should I wash the dishes? Or should I throw the dishes throught the window?

                = Usage =
                Skyra, rng word1, word2, word3, ...

                = Examples =
                • Skyra, rng Should Wash the dishes, Throw the dishes throught the window
                    Throw the dishes throught the window
                • Skyra, rng Cat, Dog
                    Cat
            `
        });
    }

    async run(msg, [...options]) {
        const words = this.filterWords(options);
        return msg.send([
            `🕺 *Eeny, meeny, miny, moe, catch a tiger by the toe...* ${msg.author}, I choose:\n`,
            `${'```'}${words[Math.floor(Math.random() * words.length)]}${'```'}`
        ]);
    }

    filterWords(words) {
        if (words.length < 2) throw "please write at least 2 options separated with ', '.";

        const output = [];
        const filtered = [];
        for (let i = 0; i < words.length; i++) {
            if (!output.includes(words[i])) output.push(words[i]);
            else filtered.push(words[i]);
        }

        if (output.length < 2) throw `why would I accept duplicated words? '${filtered.join("', '")}'.`;

        return output;
    }

};
