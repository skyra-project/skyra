const { structures: { Command }, util: { util, Stopwatch } } = require('../../index');
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

	/**
     * Run the command.
     * @param {external:Message} msg The message which executed this command.
     * @param {string[]} args The C# code to write, compile, and execute.
     * @returns {Promise<external:Message>}
     */
	async run(msg, [args]) {
		const start = new Stopwatch(5);
		const { input } = this.parse(args);
		await fsn.outputFileAtomic('/bwd/cs/eval.cs', input);
		const error = await this.compile(start);
		if (error !== null) return msg.send(error);
		const { success, result } = await this.execute();
		return msg.send(`${success ? '⚙ **Compiled and executed:**' : '❌ **Error:**'} Took ${start.stop()}${util.codeBlock('cs', result)}`);
	}

	/**
     * Compile the C# code.
     * @param {StopWatch} start The stopwatch instance to measure compiler time.
     * @returns {Promise<void>}
     */
	compile(start) {
		return util.exec('mcs /bwd/cs/eval.cs')
			.then(() => null)
			.catch(error => `Failed to compile (${start.stop()}). ${util.codeBlock('cs', error
				.toString()
				.replace('Error: Command failed: mcs /bwd/cs/eval.cs\n', '')
				.replace(/\/bwd\/cs\/eval.cs/g, 'Failed at: '))}`);
	}

	/**
     * Execute the C# code, taking output as console's output.
     * @returns {Promise<{ success: boolean, result: string }>}
     */
	execute() {
		return Promise.race([
			util.exec('/bwd/cs/eval.exe')
				.then(result => ({ success: true, result: result.stdout }))
				.catch(error => ({ success: false, result: error })),
			util.sleep(10000)
				.then(() => ({ success: false, result: 'TimeException: Execution took more than 10000ms (Timeout Reached).' }))
		]);
	}

	/**
     * Wrap the code for execution.
     * @param {string} code The code to process
     * @returns {{ type: ('raw'|'function'), input: string }}
     */
	parse(code) {
		const params = code.split('\n');
		switch (params[0]) {
			case '--raw': return { type: 'raw', input: params.slice(1).join('\n') };
			case '--fn':
			case '--function': return { type: 'function', input: TEMPLATES.function(params.slice(1).join('\n')) };
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
