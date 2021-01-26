import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SkyraCommand.Options>({
	bucket: 2,
	cooldown: 10,
	description: LanguageKeys.Commands.Management.SetStarboardEmojiDescription,
	extendedHelp: LanguageKeys.Commands.Management.SetStarboardEmojiExtended,
	permissionLevel: PermissionLevels.Administrator,
	runIn: ['text']
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const emoji = await args.pick('emoji');
		await message.guild.writeSettings((settings) => {
			// If it's the same value, throw:
			if (settings[GuildSettings.Starboard.Emoji] === emoji) {
				throw args.t(LanguageKeys.Misc.ConfigurationEquals);
			}

			// Else set the new value:
			settings[GuildSettings.Starboard.Emoji] = emoji;
		});

		return message.send(args.t(LanguageKeys.Commands.Management.SetStarboardEmojiSet, { emoji: emoji.includes(':') ? `<${emoji}>` : emoji }));
	}
}
