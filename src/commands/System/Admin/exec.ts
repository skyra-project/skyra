const { Command, klasaUtil: { exec, codeBlock }, MessageAttachment, util: { fetch } } = require('../../../index');

export default class extends Command {

	public constructor(client: Skyra, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['execute'],
			description: (language) => language.get('COMMAND_EXEC_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_EXEC_EXTENDED'),
			guarded: true,
			permissionLevel: 10,
			usage: '<expression:string>'
		});
	}

	public async run(msg, [input]) {
		const result = await exec(input, { timeout: 'timeout' in msg.flags ? Number(msg.flags.timeout) : 60000 })
			.catch((error) => ({ stdout: null, stderr: error }));
		const output = result.stdout ? `**\`OUTPUT\`**${codeBlock('prolog', result.stdout)}` : '';
		const outerr = result.stderr ? `**\`ERROR\`**${codeBlock('prolog', result.stderr)}` : '';
		const joined = [output, outerr].join('\n') || 'No output';

		return msg.sendMessage(joined.length > 2000 ? await this.getHaste(joined).catch(() => new MessageAttachment(Buffer.from(joined), 'output.txt')) : joined);
	}

	public async getHaste(result) {
		const body = await fetch('https://hastebin.com/documents', { method: 'JSON', body: result });
		return `https://hastebin.com/${body.key}.js`;
	}

}
