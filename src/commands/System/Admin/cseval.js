const { Command, Stopwatch, klasaUtil: { codeBlock, exec }, rootFolder } = require('../../../index');
const fsn = require('fs-nextra');

const BWD_FOLDER = require('path').join(rootFolder, 'bwd', 'cs');
const S_LOCATION = require('path').join(BWD_FOLDER, 'eval.cs');
const E_LOCATION = require('path').join(BWD_FOLDER, 'eval.exe');
const CSC_COMMAND = `csc ${S_LOCATION}`;
const MONO_COMMAND = `mono ${E_LOCATION}`;
const EXEC_OPTIONS = { timeout: 30000, cwd: BWD_FOLDER };

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
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
		await fsn.outputFileAtomic(S_LOCATION, input);
		const error = await this.compile(start);
		if (error !== null) return msg.sendMessage(error);
		const { success, result } = await this.execute();
		return msg.sendMessage(`${success ? '⚙ **Compiled and executed:**' : '❌ **Error:**'} Took ${start.stop()}${codeBlock('cs', result || 'Success! No output.')}`);
	}

	/**
     * Compile the C# code.
     * @param {Stopwatch} start The stopwatch instance to measure compiler time.
     * @returns {Promise<?string>}
     */
	compile(start) {
		return exec(CSC_COMMAND, EXEC_OPTIONS)
			.then(() => null)
			.catch(error => `Failed to compile (${start.stop()}). ${codeBlock('cs', `${error.stdout}\n${error.stderr}`
				.replace(/\/bwd\/cs\/eval.cs/g, 'Failed at: '))}`);
	}

	/**
     * Execute the C# code, taking output as console's output.
     * @returns {Promise<{ success: boolean, result: string }>}
     */
	execute() {
		return exec(MONO_COMMAND, EXEC_OPTIONS)
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
