import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	cooldown: 5,
	description: LanguageKeys.Commands.Misc.VaporwaveDescription,
	extendedHelp: LanguageKeys.Commands.Misc.VaporwaveExtended,
	spam: true,
	usage: '<input:string>'
})
export default class extends SkyraCommand {
	public async run(message: Message, [input]: [string]) {
		let output = '';
		for (let i = 0; i < input.length; i++) output += input[i] === ' ' ? ' ' : String.fromCharCode(input.charCodeAt(i) + 0xfee0);
		return message.sendTranslated(LanguageKeys.Commands.Misc.VaporwaveOutput, [{ str: output }]);
	}
}
