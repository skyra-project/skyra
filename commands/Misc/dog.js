const { Command } = require('../../index');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['doggo'],
            spam: true,

            cooldown: 10,

            description: 'Check this doggo! ❤',
            extend: {
                EXPLANATION: [
                    'Do **you** know how cute are dogs? They are so beautiful! This command uses a tiny selection of images',
                    'From WallHaven, but the ones with the greatest quality! I need to find more of them, and there are',
                    'some images that, sadly, got deleted and I cannot retrieve them 💔.'
                ].join(' ')
            }
        });

        this.rand = [
            '55991', '56020', '236567', '215795', '198588', '239388', '55709',
            '304011', '239386', '137479', '95278', '393154', '61910', '264155',
            '239389', '239395', '293551', '22761', '265279', '137000', '293552',
            '449188', '140491', '203497', '112888', '3058440', '371698', '277752',
            '179920', '96127', '261963', '106499'
        ];

        this.index = Math.ceil(Math.random() * this.rand.length);
    }

    async run(msg) {
        if (this.index === this.rand.length - 1) this.index = 0;
        else this.index++;

        const embed = new MessageEmbed()
            .setColor(msg.color)
            .setImage(`https://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-${this.rand[this.index]}.jpg`);

        return msg.send({ embed });
    }

};
