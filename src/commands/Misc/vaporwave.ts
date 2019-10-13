import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 5,
			description: language => language.tget('COMMAND_VAPORWAVE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_VAPORWAVE_EXTENDED'),
			spam: true,
			usage: '<input:string>'
		});
	}

	public async run(message: KlasaMessage, [input]: [string]) {
		let output = '';
		for (let i = 0; i < input.length; i++) output += input[i] === ' ' ? ' ' : String.fromCharCode(input.charCodeAt(i) + 0xFEE0);
		return message.sendLocale('COMMAND_VAPORWAVE_OUTPUT', [output]);
	}

}
