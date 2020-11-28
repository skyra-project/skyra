import { SkyraCommand } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['updoot'],
			description: (language) => language.get(LanguageKeys.Commands.Misc.UpvoteDescription),
			extendedHelp: (language) => language.get(LanguageKeys.Commands.Misc.UpvoteExtended)
		});
	}

	public run(message: KlasaMessage) {
		return message.sendLocale(LanguageKeys.Commands.Misc.UpvoteMessage);
	}
}
