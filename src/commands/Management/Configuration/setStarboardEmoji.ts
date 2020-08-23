import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { resolveEmoji } from '@utils/util';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get('commandSetStarboardEmojiDescription'),
			extendedHelp: (language) => language.get('commandSetStarboardEmojiExtended'),
			permissionLevel: PermissionLevels.Administrator,
			runIn: ['text'],
			usage: '<Emoji:emoji>'
		});

		this.createCustomResolver('emoji', (arg, possible, msg) => {
			const resolved = resolveEmoji(arg);
			if (resolved) return resolved;
			throw msg.language.get('resolverInvalidEmoji', { name: possible.name });
		});
	}

	public async run(message: KlasaMessage, [emoji]: [string]) {
		if (message.guild!.settings.get(GuildSettings.Starboard.Emoji) === emoji) throw message.language.get('configurationEquals');
		await message.guild!.settings.update(GuildSettings.Starboard.Emoji, emoji, {
			extraContext: { author: message.author.id }
		});
		return message.sendLocale('commandSetStarboardEmojiSet', [{ emoji: emoji.includes(':') ? `<${emoji}>` : emoji }]);
	}
}
