const { Command } = require('../../index');

export default class extends Command {

	public constructor(client: Skyra, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			cooldown: 5,
			description: (language) => language.get('COMMAND_VAPORWAVE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_VAPORWAVE_EXTENDED'),
			usage: '<phrase:string>'
		});

		this.spam = true;
	}

	public async run(msg, [string]) {
		let output = '';
		for (let i = 0; i < string.length; i++) output += string[i] === ' ' ? ' ' : String.fromCharCode(string.charCodeAt(i) + 0xFEE0);
		return msg.sendLocale('COMMAND_VAPORWAVE_OUTPUT', [output]);
	}

}
