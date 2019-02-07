import { CommandStore, KlasaClient, KlasaMessage, Stopwatch, util } from 'klasa';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';

export default class extends SkyraCommand {

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['d-ev', 'dashboard-eval'],
			description: (language) => language.get('COMMAND_EVAL_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_EVAL_EXTENDED'),
			guarded: true,
			permissionLevel: 10,
			usage: '<expression:str>'
		});
	}

	public async run(message: KlasaMessage, [code]: [string]) {
		if (message.flags.async) code = `(async () => {\n${code}\n})();`;
		let result: string, success: boolean, time: string;

		const stopwatch = new Stopwatch();
		try {
			[success, result] = await this.client.ipc.sendTo('ny-api', ['eval', code]);
			time = stopwatch.toString();
		} catch (error) {
			time = stopwatch.toString();
			result = error.error || error;
			success = false;
		}

		return message.send(`⏱ ${time} | **${success ? 'Output' : 'Error'}**${util.codeBlock('js', result)}`);
	}

}
