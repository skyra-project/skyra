import { SkyraCommand } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['updoot'],
			description: LanguageKeys.Commands.Misc.UpvoteDescription,
			extendedHelp: LanguageKeys.Commands.Misc.UpvoteExtended
		});
	}

	public run(message: KlasaMessage) {
		return message.sendTranslated(LanguageKeys.Commands.Misc.UpvoteMessage);
	}
}
