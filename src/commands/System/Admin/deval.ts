import { Command, Stopwatch, klasaUtil : { codeBlock }; } from; '../../../index';

export default class extends Command {

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['d-ev', 'dashboard-eval'],
			description: (language) => language.get('COMMAND_EVAL_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_EVAL_EXTENDED'),
			guarded: true,
			permissionLevel: 10,
			usage: '<expression:str>'
		});
	}

	public async run(msg, [code]) {
		if (msg.flags.async) code = `(async () => {\n${code}\n})();`;
		let result, success, time;

		const stopwatch = new Stopwatch();
		try {
			[success, result] = await this.client.ipc.sendTo('ny-api', ['eval', code]);
			time = stopwatch.toString();
		} catch (error) {
			time = stopwatch.toString();
			result = error.error || error;
			success = false;
		}

		return msg.send(`⏱ ${time} | **${success ? 'Output' : 'Error'}**${codeBlock('js', result)}`);
	}

}
