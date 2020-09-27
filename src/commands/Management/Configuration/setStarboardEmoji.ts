import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { resolveEmoji } from '@utils/util';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get(LanguageKeys.Commands.Management.SetStarboardEmojiDescription),
			extendedHelp: (language) => language.get(LanguageKeys.Commands.Management.SetStarboardEmojiExtended),
			permissionLevel: PermissionLevels.Administrator,
			runIn: ['text'],
			usage: '<Emoji:emoji>'
		});

		this.createCustomResolver('emoji', (arg, possible, msg) => {
			const resolved = resolveEmoji(arg);
			if (resolved) return resolved;
			throw msg.language.get(LanguageKeys.Resolvers.InvalidEmoji, { name: possible.name });
		});
	}

	public async run(message: KlasaMessage, [emoji]: [string]) {
		if (message.guild!.settings.get(GuildSettings.Starboard.Emoji) === emoji) throw message.language.get(LanguageKeys.Misc.ConfigurationEquals);
		await message.guild!.settings.update(GuildSettings.Starboard.Emoji, emoji, {
			extraContext: { author: message.author.id }
		});
		return message.sendLocale(LanguageKeys.Commands.Management.SetStarboardEmojiSet, [{ emoji: emoji.includes(':') ? `<${emoji}>` : emoji }]);
	}
}
