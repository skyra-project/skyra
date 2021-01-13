import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { Message } from 'discord.js';

@ApplyOptions<SkyraCommandOptions>({
	description: LanguageKeys.Commands.System.DonateDescription,
	extendedHelp: LanguageKeys.Commands.System.DonateExtended,
	guarded: true
})
export default class extends SkyraCommand {
	public async run(message: Message) {
		const t = await message.fetchT();
		try {
			const extended = t(this.extendedHelp).extendedHelp!;
			const response = await message.author.send(extended);
			return message.channel.type === 'text' ? await message.alert(t(LanguageKeys.Commands.System.DmSent)) : response;
		} catch {
			return message.channel.type === 'text' ? null : message.alert(t(LanguageKeys.Commands.System.DmNotSent));
		}
	}
}
