import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { ApplyOptions } from '@skyra/decorators';
import { Message } from 'discord.js';

@ApplyOptions<SkyraCommandOptions>({
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
