import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.System.DonateDescription,
	extendedHelp: LanguageKeys.Commands.System.DonateExtended,
	guarded: true
})
export class UserCommand extends SkyraCommand {
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
