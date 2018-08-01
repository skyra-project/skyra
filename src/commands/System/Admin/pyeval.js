const { Command, Stopwatch, util } = require('klasa');
const fsn = require('fs-nextra');

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			aliases: ['pythoneval'],
			description: (language) => language.get('COMMAND_PYEVAL_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_PYEVAL_EXTENDED'),
			guarded: true,
			permissionLevel: 10,
			usage: '<pycode:string>'
		});
	}

	async run(msg, [input]) {
		const start = new Stopwatch(5);
		await fsn.outputFileAtomic('/bwd/python/eval.py', input);
		const { success, result } = await this.execute('py3' in msg.flags ? 'python3' : 'python');
		return msg.sendMessage(`${success ? '⚙ **Executed:**' : '❌ **Error:**'} Took ${start.stop()}${util.codeBlock('python', result)}`);
	}

	/**
     * Execute the Python code, taking output as console's output.
	 * @param {('python'|'python3')} command The code to execute
     * @returns {Promise<{ success: boolean, result: string }>}
     */
	execute(command) {
		return util.exec(`${command} /bwd/python/eval.py`, { timeout: 30000 })
			.then(result => ({ success: true, result: result.stdout }))
			.catch(error => ({ success: false, result: error }));
	}

};
