const { Command, Stopwatch, klasaUtil: { codeBlock, exec, regExpEsc }, rootFolder } = require('../../../index');
const fsn = require('fs-nextra');

const BWD_FOLDER = require('path').join(rootFolder, 'bwd', 'cpp');
const S_LOCATION = require('path').join(BWD_FOLDER, 'eval.cpp');
const E_LOCATION = require('path').join(BWD_FOLDER, 'eval.out');
const GCC_COMMAND = `g++ ${S_LOCATION} -o ${E_LOCATION}`;
const MONO_COMMAND = `${E_LOCATION}`;
const EXEC_OPTIONS = { timeout: 30000, cwd: BWD_FOLDER };
const REPLACER = new RegExp(regExpEsc(S_LOCATION), 'g');

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			aliases: ['cppev', 'c++eval', 'c++ev'],
			description: (language) => language.get('COMMAND_CPPEVAL_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_CPPEVAL_EXTENDED'),
			guarded: true,
			permissionLevel: 10,
			usage: '<cppcode:string>'
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

	compile(start) {
		return exec(GCC_COMMAND, EXEC_OPTIONS)
			.then(() => null)
			.catch(error => `Failed to compile (${start.stop()}). ${codeBlock('cs', `${error.stdout}\n${error.stderr}`
				.replace(REPLACER, 'Failed at'))}`);
	}

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
#include <iostream>

int main()
{
    ${code}
    ${/return/.test(code) ? '' : 'return 0;'}
}
    `
};
