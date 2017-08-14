const { Command } = require('../../index');
const { MessageEmbed } = require('discord.js');

const rand = [
    '55991', '56020', '236567', '215795', '198588', '239388', '55709',
    '304011', '239386', '137479', '95278', '393154', '61910', '264155',
    '239389', '239395', '293551', '22761', '265279', '137000', '293552',
    '449188', '140491', '203497', '112888', '3058440', '371698', '277752',
    '179920', '96127', '261963', '106499'
];

/* eslint-disable class-methods-use-this */
module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['doggo'],
            spam: true,

            description: 'Check this doggo! ❤',
            extendedHelp: Command.strip`
                Aww, have you seen this doggo? It's so cute!

                = Usage =
                Skyra, dog
            `
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
