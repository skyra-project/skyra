const { Command, Stopwatch, util } = require('klasa');
const fsn = require('fs-nextra');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['c#eval', 'csev', 'c#ev'],
			description: (language) => language.get('COMMAND_CSEVAL_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_CSEVAL_EXTENDED'),
			guarded: true,
			permissionLevel: 10,
			usage: '<cscode:string>'
		});
	}

	async run(msg, [args]) {
		const start = new Stopwatch(5);
		const { input } = this.parse(msg, args);
		await fsn.outputFileAtomic('/bwd/cs/eval.cs', input);
		const error = await this.compile(start);
		if (error !== null) return msg.sendMessage(error);
		const { success, result } = await this.execute();
		return msg.sendMessage(`${success ? '⚙ **Compiled and executed:**' : '❌ **Error:**'} Took ${start.stop()}${util.codeBlock('cs', result || 'Success! No output.')}`);
	}

	/**
     * Compile the C# code.
     * @param {StopWatch} start The stopwatch instance to measure compiler time.
     * @returns {Promise<?string>}
     */
	compile(start) {
		return util.exec('csc /bwd/cs/eval.cs', { timeout: 30000, cwd: '/bwd/cs/' })
			.then(() => null)
			.catch(error => `Failed to compile (${start.stop()}). ${util.codeBlock('cs', `${error.stdout}\n${error.stderr}`
				.replace(/\/bwd\/cs\/eval.cs/g, 'Failed at: '))}`);
	}

	/**
     * Execute the C# code, taking output as console's output.
     * @returns {Promise<{ success: boolean, result: string }>}
     */
	execute() {
		return util.exec('mono /bwd/cs/eval.exe', { timeout: 30000, cwd: '/bwd/cs/' })
			.then(result => ({ success: true, result: `${result.stdout}\n${result.stderr}` }))
			.catch(error => ({ success: false, result: `${error.stdout}\n${error.stderr}` }));
	}

	parse(msg, input) {
		if ('raw' in msg.flags) return { type: 'raw', input };
		return { type: 'function', input: TEMPLATES.function(input) };
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
    }

    static object Execute()
    {
        ${/return/.test(code) ? code : `${code}\n\t\treturn null;`}
    }
}
    `
};
