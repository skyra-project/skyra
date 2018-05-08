const { Command, Stopwatch, util } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['d-ev', 'dashboard-eval'],
			description: (msg) => msg.language.get('COMMAND_EVAL_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_EVAL_EXTENDED'),
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
			({ result } = await this.client.ipc.send('dashboard', { route: 'eval', code }));
			time = stopwatch.friendlyDuration;
			success = true;
		} catch (error) {
			time = stopwatch.friendlyDuration;
			result = error.error || error;
			success = false;
		}

		return msg.send(`⏱ ${time} | **${success ? 'Output' : 'Error'}**${util.codeBlock('js', result)}`);
	}

};
