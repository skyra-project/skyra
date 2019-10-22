import { MessageAttachment } from 'discord.js';
import { CommandStore, KlasaMessage, util } from 'klasa';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';
import { fetch } from '../../../lib/util/util';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['execute'],
			description: language => language.tget('COMMAND_EXEC_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_EXEC_EXTENDED'),
			guarded: true,
			permissionLevel: 10,
			usage: '<expression:string>',
			flagSupport: true
		});
	}

	public async run(message: KlasaMessage, [input]: [string]) {
		const result = await util.exec(input, { timeout: 'timeout' in message.flagArgs ? Number(message.flagArgs.timeout) : 60000 })
			.catch(error => ({ stdout: null, stderr: error }));
		const output = result.stdout ? `**\`OUTPUT\`**${util.codeBlock('prolog', result.stdout)}` : '';
		const outerr = result.stderr ? `**\`ERROR\`**${util.codeBlock('prolog', result.stderr)}` : '';
		const joined = [output, outerr].join('\n') || 'No output';

		return message.sendMessage(joined.length > 2000 ? await this.getHaste(joined).catch(() => new MessageAttachment(Buffer.from(joined), 'output.txt')) : joined);
	}

	private async getHaste(result: string) {
		const { key } = await fetch('https://hasteb.in/documents', { method: 'POST', body: result }, 'json') as { key: string };
		return `https://hasteb.in/${key}.js`;
	}

}
