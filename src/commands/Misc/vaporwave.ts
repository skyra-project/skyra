import { KlasaMessage } from 'klasa';
import { SkyraCommand, SkyraCommandOptions } from '../../lib/structures/SkyraCommand';
import { ApplyOptions } from '../../lib/util/util';

@ApplyOptions<SkyraCommandOptions>({
	cooldown: 5,
	description: language => language.tget('COMMAND_VAPORWAVE_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_VAPORWAVE_EXTENDED'),
	spam: true,
	usage: '<input:string>'
})
export default class extends SkyraCommand {

	public async run(message: KlasaMessage, [input]: [string]) {
		let output = '';
		for (let i = 0; i < input.length; i++) output += input[i] === ' ' ? ' ' : String.fromCharCode(input.charCodeAt(i) + 0xFEE0);
		return message.sendLocale('COMMAND_VAPORWAVE_OUTPUT', [output]);
	}

}
