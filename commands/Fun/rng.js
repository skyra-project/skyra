const { Command } = require('../../index');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['choice'],
            spam: true,

            cooldown: 10,

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

    async run(msg, [...options], settings, i18n) {
        const words = this.filterWords(options, i18n);
        return msg.send(i18n.get('COMMAND_RNG', msg.author, words[Math.floor(Math.random() * words.length)]));
    }

    filterWords(words, i18n) {
        if (words.length < 2) throw i18n.get('COMMAND_RNG_MISSING');

        const output = [];
        const filtered = [];
        for (let i = 0; i < words.length; i++) {
            if (!output.includes(words[i])) output.push(words[i]);
            else filtered.push(words[i]);
        }

        if (output.length < 2) throw i18n.get('COMMAND_RNG_DUP', filtered.join('\', \''));

        return output;
    }

};
