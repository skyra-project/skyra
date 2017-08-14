const { Command, util } = require('../../index');
const now = require('performance-now');
const math = require('mathjs');

/* eslint-disable class-methods-use-this */
module.exports = class Calculator extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['calculate', 'calc', 'math'],
            mode: 1,

            usage: '<equation:string>',
            description: 'Calculate arbitrary maths.',
            extendedHelp: Command.strip`
                Take a look in mathjs.org/docs/index.html#documentation

                = Usage =
                Skyra, calculate [equation]
                Equation :: The math equation to calculate.

                = Reminder =
                This command supports matrices, complex numbers, fractions, big numbers, and even, algebra.
            `
        });
    }

    async run(msg, [equation]) {
        const start = now();
        const evaled = await math.eval(equation);
        return msg.send(`⚙ **Calculated** (${(now() - start).toFixed(3)}μs)${'```'}js\n${util.clean(evaled)}${'```'}`);
    }

};
