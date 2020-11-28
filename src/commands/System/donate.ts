import { SkyraCommand } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: (language) => language.get(LanguageKeys.Commands.System.DonateDescription),
			extendedHelp: (language) => language.get(LanguageKeys.Commands.System.DonateExtended),
			guarded: true
		});
	}

	public async run(message: KlasaMessage) {
		const language = await message.fetchLanguage();
		try {
			const extended = (language.get(LanguageKeys.Commands.System.DonateExtended).extendedHelp as string[]).join('\n');
			const response = await message.author.send(extended);
			return message.channel.type === 'text' ? await message.alert(language.get(LanguageKeys.Commands.System.DmSent)) : response;
		} catch {
			return message.channel.type === 'text' ? null : message.alert(language.get(LanguageKeys.Commands.System.DmNotSent));
		}
	}
}
