const { Command } = require('../../index');

/* eslint-disable class-methods-use-this */
module.exports = class extends Command {

    constructor(...args) {
        super(...args, 'dice', {
            spam: true,

            usage: '[rolls:int{1,1024}] [sides:int{4,1024}]',
            description: 'Roll the dice, \'x\' rolls and \'y\' sides.',
            extendedHelp: Command.strip`
                The Dice: A misterious Dice for misterious people.

                = Usage =
                Skyra, dice [rolls] [sides]
                Rolls :: Defaults to 1, amount of times the dice should roll.
                Sides :: Defaults to 6, amount of sides the dice should have.

                = Examples =
                • Skyra, dice 370 24
                    4412
                • Skyra, dice 100 6
                    354
                • Skyra, dice 6
                    22
            `
        });
    }

    async run(msg, [rl = 1, sd = 6]) {
        return msg.send(`Dear ${msg.author}, you rolled the **${sd}**-dice **${rl}** times, you got: **${this.roll(rl, sd)}**`);
    }

    roll(rolls, sides) {
        let total = 0;
        for (let i = 0; i < rolls; i++) total += Math.floor(Math.random() * (sides + 1));
        return total;
    }

};
