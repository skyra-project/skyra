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
			description: (language) => language.tget('COMMAND_SETSTARBOARDEMOJI_DESCRIPTION'),
			extendedHelp: (language) => language.tget('COMMAND_SETSTARBOARDEMOJI_EXTENDED'),
			permissionLevel: PermissionLevels.Administrator,
			runIn: ['text'],
			usage: '<Emoji:emoji>'
		});

		this.createCustomResolver('emoji', (arg, possible, msg) => {
			const resolved = resolveEmoji(arg);
			if (resolved) return resolved;
			throw msg.language.tget('RESOLVER_INVALID_EMOJI', possible.name);
		});
	}

	public async run(message: KlasaMessage, [emoji]: [string]) {
		if (message.guild!.settings.get(GuildSettings.Starboard.Emoji) === emoji) throw message.language.tget('CONFIGURATION_EQUALS');
		await message.guild!.settings.update(GuildSettings.Starboard.Emoji, emoji, {
			extraContext: { author: message.author.id }
		});
		return message.sendLocale('COMMAND_SETSTARBOARDEMOJI_SET', [emoji.includes(':') ? `<${emoji}>` : emoji]);
	}
}
