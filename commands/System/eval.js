const { Command } = require('../../index');
const { inspect } = require('util');
const now = require('performance-now');

const zws = String.fromCharCode(8203);
let sensitivePattern;

/* eslint-disable no-eval, class-methods-use-this */
module.exports = class extends Command {

    constructor(...args) {
        super(...args, 'eval', {
            aliases: ['ev'],
            permLevel: 10,
            mode: 2,

            usage: '<expression:string>',
            description: 'Evaluates arbitrary Javascript.'
        });
    }

    async run(msg, [args]) {
        const { type, input } = this.parse(args.split(' '));
        const start = now();
        const out = await this.eval(type ? `(async () => { ${input} })()` : input);
        const time = now() - start;
        if (out.success === false && this.client.debugMode === true) out.output = out.output.stack || out.output.message;
        if (out.output === undefined || out.output === '') out.output = '<void>';
        return msg.send([
            `➡ **Input:** Executed in ${time.toFixed(5)}μs`,
            out.success ? '🔍 **Inspect:**' : '❌ **Error:**',
            Command.codeBlock('js', this.clean(out.output))
        ]).catch(err => msg.error(err));
    }

    async eval(input) {
        try {
            let res = eval(input);
            if (res instanceof Promise) res = await res.catch(err => { throw err; });
            return { success: true, output: res };
        } catch (err) {
            return { success: false, output: err };
        }
    }

    clean(text) {
        let toClean;

        if (typeof text === 'object' && typeof text !== 'string') {
            toClean = inspect(text, { depth: 0, showHidden: true });
        } else {
            toClean = text;
        }

        if (typeof toClean === 'string') {
            return toClean.replace(sensitivePattern, '「ｒｅｄａｃｔｅｄ」').replace(/`/g, `\`${zws}`).replace(/@/g, `@${zws}`);
        }
        return toClean;
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

    init(client) {
        const patterns = [];
        if (client.token) patterns.push(client.token);
        if (client.user.email) patterns.push(client.user.email);
        if (client.password) patterns.push(client.password);
        sensitivePattern = new RegExp(patterns.join('|'), 'gi');
    }

};
