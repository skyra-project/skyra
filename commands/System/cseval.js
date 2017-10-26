const { Command, util, StopWatch } = require('../../index');
const fsn = require('fs-nextra');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['c#eval', 'csev', 'c#ev'],
            permLevel: 10,
            mode: 2,

            usage: '<cscode:string>',
            description: 'Evaluates arbitrary C#.'
        });
    }

    async run(msg, [args]) {
        const start = new StopWatch(5);
        const { input } = this.parse(args);
        await fsn.outputFileAtomic('/bwd/cs/eval.cs', input);
        const error = await this.compile(start);
        if (error !== null) return msg.send(error);
        const { success, result } = await this.execute();
        return msg.send(`${success ? '⚙ **Compiled and executed:**' : '❌ **Error:**'} Took ${start.stop()}${util.codeBlock('cs', result)}`);
    }

    compile(start) {
        return util.exec('mcs /bwd/cs/eval.cs')
            .then(() => null)
            .catch(error => `Failed to compile (${start.stop()}). ${util.codeBlock('cs', error
                .toString()
                .replace('Error: Command failed: mcs /bwd/cs/eval.cs\n', '')
                .replace(/\/bwd\/cs\/eval.cs/g, 'Failed at: '))}`);
    }

    execute() {
        return util.exec('/bwd/cs/eval.exe')
            .then(result => ({ success: true, result: result.stdout }))
            .catch(error => ({ success: false, result: error }));
    }

    /**
     * Blep
     * @param {string} code The code to process
     * @returns {{ type: ('raw'|'function'|'async'), input: string }}
     */
    parse(code) {
        const params = code.split('\n');
        switch (params[0]) {
            case '--raw': return { type: 'raw', input: params.slice(1).join('\n') };
            case '--fn':
            case '--function': return { type: 'function', input: TEMPLATES.function(params.slice(1).join('\n')) };
            // case '--async': return { type: 'async', input: TEMPLATES.async(params.slice(1).join('\n')) };
            default: {
                const type = /async/.test(params) ? 'async' : 'function';
                return { type, input: TEMPLATES[type](code) };
            }
        }
    }

};

const TEMPLATES = {
    function: (code) => `
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

class Program
{
    static void Main(string[] args)
    {
        var input = Execute();
        if (input is string)
        {
            Console.WriteLine(input);
        }
        else if (input != null)
        {
            Console.WriteLine(input.ToString());
        }
        else
        {
            Console.WriteLine("Success! No output.");
        }
    }

    static object Execute()
    {
        ${/return/.test(code) ? code : `${code}\n\t\treturn null;`}
    }
}
    `
};
