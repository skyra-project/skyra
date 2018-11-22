import fsn from 'fs-nextra';
import { Command, Stopwatch, util } from 'klasa';

export default class extends Command {

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['pythoneval'],
			description: (language) => language.get('COMMAND_PYEVAL_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_PYEVAL_EXTENDED'),
			guarded: true,
			permissionLevel: 10,
			usage: '<pycode:string>'
		});
	}

	public async run(msg, [input]) {
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
	public execute(command) {
		return util.exec(`${command} /bwd/python/eval.py`, { timeout: 30000 })
			.then((result) => ({ success: true, result: result.stdout }))
			.catch((error) => ({ success: false, result: error }));
	}

}
