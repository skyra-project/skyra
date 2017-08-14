const { Command, util } = require('../../index');

/* eslint-disable no-eval, class-methods-use-this */
module.exports = class ClearEval extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['cev'],
            permLevel: 10,
            mode: 2,

            usage: '<expression:string>',
            description: 'Evaluates arbitrary Javascript.'
        });
    }

    async run(msg, [args]) {
        const { type, input } = this.parse(args.split(' '));
        const toEval = type ? `(async () => { ${input} })()` : input;
        await eval(toEval);
        if (util.hasPermission(msg, 'ADD_REACTIONS')) return msg.react('👌🏽').catch(() => msg.alert('Executed!'));
        return null;
    }

    parse(toEval) {
        let input;
        let type;
        if (toEval[0] === 'async') {
            input = toEval.slice(1).join(' ');
            type = true;
        } else {
            input = toEval.join(' ');
            type = false;
        }
        return { type, input };
    }

};
