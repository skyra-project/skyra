import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 5,
			description: (language) => language.get(LanguageKeys.Commands.Misc.VaporwaveDescription),
			extendedHelp: (language) => language.get(LanguageKeys.Commands.Misc.VaporwaveExtended),
			spam: true,
			usage: '<input:string>'
		});
	}

	public async run(message: KlasaMessage, [input]: [string]) {
		let output = '';
		for (let i = 0; i < input.length; i++) output += input[i] === ' ' ? ' ' : String.fromCharCode(input.charCodeAt(i) + 0xfee0);
		return message.sendLocale(LanguageKeys.Commands.Misc.VaporwaveOutput, [{ str: output }]);
	}
}
