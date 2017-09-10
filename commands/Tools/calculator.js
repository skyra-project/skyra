const { Command, util } = require('../../index');
const now = require('performance-now');
const math = require('mathjs');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['calculate', 'calc', 'math'],
            mode: 1,
            cooldown: 10,

            usage: '<equation:string>',
            description: 'Calculate arbitrary maths.',
            extendedHelp: Command.strip`
                Take a look in mathjs.org/docs/index.html#documentation

                ⚙ | ***Explained usage***
                Skyra, calculate [equation]
                Equation :: The math equation to calculate.

                = Reminder =
                This command supports matrices, complex numbers, fractions, big numbers, and even, algebra.
            `
        });
    }

    run(msg, [equation], settings, i18n) {
        const start = now();
        try {
            const evaled = math.eval(equation);
            return msg.send(i18n.get('COMMAND_CALC', (now() - start).toFixed(3), util.codeBlock('js', util.clean(evaled))));
        } catch (error) {
            return msg.send(i18n.get('COMMAND_CALC_FAILURE', (now() - start).toFixed(3), util.codeBlock('js', error)));
        }
    }

};
