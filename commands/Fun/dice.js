const { Command } = require('../../index');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            spam: true,

            cooldown: 5,

            usage: '[rolls:int{1,1024}] [sides:int{4,1024}]',
            usageDelim: ' ',
            description: 'Roll the dice, \'x\' rolls and \'y\' sides.',
            extend: {
                EXPLANATION: [
                    'The mechanics of this command are easy. You have a dice, then you roll it __x__ times, but the dice',
                    'can also be configured to have __y__ sides. By default, this command rolls a dice with 6 sides once.',
                    'However, you can change the amount of rolls for the dice, and this command will \'roll\' (get a random',
                    'number between 1 and the amount of sides). For example, rolling a dice with 6 sides 3 times will leave',
                    'a random sequence of three random numbers between 1 and 6, for example: 3, 1, 6; And this command will',
                    'return 10 as output.'
                ].join(' '),
                ARGUMENTS: '[rolls] [sides]',
                EXP_USAGE: [
                    ['rolls', 'Defaults to 1, amount of times the dice should roll.'],
                    ['sides', 'Defaults to 6, amount of sides the dice should have.']
                ],
                EXAMPLES: ['370 24', '100 6', '6']
            }
        });
    }

    async run(msg, [rl = 1, sd = 6], settings, i18n) {
        return msg.send(i18n.get('COMMAND_DICE', sd, rl, this.roll(rl, sd)));
    }

    roll(rolls, sides) {
        let total = 0;
        for (let i = 0; i < rolls; i++) total += Math.floor(Math.random() * (sides + 1));
        return total;
    }

};
