const { Command } = require('../../index');
const { MessageEmbed } = require('discord.js');

const rand = [
    '77227', '60575', '202462', '164687', '344049', '112786', '103656',
    '384799', '207142', '73164', '42265', '60578', '94171', '78621',
    '138232', '60533', '73165', '54706', '32208', '25687', '20627',
    '64954', '136661', '340024', '447939', '457236', '426098', '180398',
    '313993', '230590', '100241', '54708', '306710', '32510', '344001'
];

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['kitten', 'kitty'],
            spam: true,

            cooldown: 10,

            description: 'Check this kitty! ❤',
            extend: {
                EXPLANATION: [
                    'Do **you** know how cute are kittens? They are so beautiful! This command uses a tiny selection of images',
                    'From WallHaven, but the ones with the greatest quality! I need to find more of them, and there are',
                    'some images that, sadly, got deleted and I cannot retrieve them 💔.'
                ].join(' ')
            }
        });

        this.index = Math.ceil(Math.random() * rand.length);
    }

    async run(msg) {
        if (this.index === rand.length - 1) this.index = 0;
        else this.index += 1;

        const embed = new MessageEmbed()
            .setColor(msg.color)
            .setImage(`https://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-${rand[this.index]}.jpg`);

        return msg.send({ embed });
    }

};
