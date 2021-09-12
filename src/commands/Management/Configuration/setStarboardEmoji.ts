import { GuildSettings, writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Management.SetStarboardEmojiDescription,
	detailedDescription: LanguageKeys.Commands.Management.SetStarboardEmojiExtended,
	permissionLevel: PermissionLevels.Administrator,
	runIn: [CommandOptionsRunTypeEnum.GuildAny]
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const emoji = await args.pick('emoji');
		await writeSettings(message.guild, (settings) => {
			// If it's the same value, throw:
			if (settings[GuildSettings.Starboard.Emoji] === emoji) {
				this.error(LanguageKeys.Misc.ConfigurationEquals);
			}

			// Else set the new value:
			settings[GuildSettings.Starboard.Emoji] = emoji;
		});

		const content = args.t(LanguageKeys.Commands.Management.SetStarboardEmojiSet, {
			emoji: emoji.startsWith('%') ? decodeURIComponent(emoji) : `<${emoji}>`
		});
		return send(message, content);
	}
}
