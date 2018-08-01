const { Command, Stopwatch, util } = require('klasa');

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			aliases: ['d-ev', 'dashboard-eval'],
			description: (language) => language.get('COMMAND_EVAL_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_EVAL_EXTENDED'),
			guarded: true,
			permissionLevel: 10,
			usage: '<expression:str>'
		});
	}

	async run(msg, [code]) {
		if (msg.flags.async) code = `(async () => {\n${code}\n})();`;
		let result, success, time;

		const stopwatch = new Stopwatch();
		try {
			({ result } = await this.client.ipc.sendTo('dashboard', { route: 'eval', code }));
			time = stopwatch.toString();
			success = true;
		} catch (error) {
			time = stopwatch.toString();
			result = error.error || error;
			success = false;
		}

		return msg.send(`⏱ ${time} | **${success ? 'Output' : 'Error'}**${util.codeBlock('js', result)}`);
	}

};
