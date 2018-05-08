const { Command, Stopwatch, util } = require('klasa');
const fsn = require('fs-nextra');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['cppev', 'c++eval', 'c++ev'],
			description: (msg) => msg.language.get('COMMAND_CPPEVAL_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_CPPEVAL_EXTENDED'),
			guarded: true,
			permissionLevel: 10,
			usage: '<cppcode:string>'
		});
	}

	async run(msg, [args]) {
		const start = new Stopwatch(5);
		const { input } = this.parse(msg, args);
		await fsn.outputFileAtomic('/bwd/cpp/eval.cpp', input);
		const error = await this.compile(start);
		if (error !== null) return msg.sendMessage(error);
		const { success, result } = await this.execute();
		return msg.sendMessage(`${success ? '⚙ **Compiled and executed:**' : '❌ **Error:**'} Took ${start.stop()}${util.codeBlock('cpp', result)}`);
	}

	compile(start) {
		return util.exec('g++ /bwd/cpp/eval.cpp -o /bwd/cpp/eval.out', { timeout: 30000 })
			.then(() => null)
			.catch(error => `Failed to compile (${start.stop()}). ${util.codeBlock('cpp', error)}`);
	}

	execute() {
		return util.exec('/bwd/cpp/eval.out', { timeout: 30000 })
			.then(result => ({ success: true, result: result.stdout }))
			.catch(error => ({ success: false, result: error }));
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

    return 0;
}
    `
};
