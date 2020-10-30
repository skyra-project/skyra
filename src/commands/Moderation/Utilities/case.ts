import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 5,
			description: (language) => language.get(LanguageKeys.Commands.Moderation.CaseDescription),
			extendedHelp: (language) => language.get(LanguageKeys.Commands.Moderation.CaseExtended),
			permissionLevel: PermissionLevels.Moderator,
			requiredPermissions: ['EMBED_LINKS'],
			runIn: ['text'],
			usage: '<latest|case:integer{0,2147483647}>'
		});
	}

	public async run(message: KlasaMessage, [index]: [number | 'latest']) {
		const modlog = index === 'latest' ? (await message.guild!.moderation.fetch()).last() : await message.guild!.moderation.fetch(index);
		if (modlog) return message.sendEmbed(await modlog.prepareEmbed());
		throw message.language.get(LanguageKeys.Commands.Moderation.ReasonNotExists);
	}
}
