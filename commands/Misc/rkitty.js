const { Command } = require('../../index');

const rand = [
    '77227', '60575', '202462', '164687', '344049', '112786', '103656',
    '384799', '207142', '73164', '42265', '60578', '94171', '78621',
    '138232', '60533', '73165', '54706', '32208', '25687', '20627',
    '64954', '136661', '340024', '447939', '457236', '426098', '180398',
    '313993', '230590', '100241', '54708', '306710', '32510', '344001'
];

/* eslint-disable class-methods-use-this */
module.exports = class extends Command {

    constructor(...args) {
        super(...args, 'cat', {
            aliases: ['kitten', 'kitty'],
            spam: true,

            description: 'Check this kitty! ❤',
            extendedHelp: Command.strip`
                Aww, have you seen this kitten? It's so cute!

                = Usage =
                Skyra, kitty
            `
        });

        this.index = Math.ceil(Math.random() * rand.length);
    }

    async run(msg) {
        if (this.index === rand.length - 1) this.index = 0;
        else this.index += 1;

        const embed = new this.client.methods.Embed()
            .setColor(msg.color)
            .setImage(`https://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-${rand[this.index]}.jpg`);

        return msg.send({ embed });
    }

};
