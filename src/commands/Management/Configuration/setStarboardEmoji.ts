import { GuildSettings } from '#lib/database/index';
import { SkyraCommand } from '#lib/structures/SkyraCommand';
import { PermissionLevels } from '#lib/types/Enums';
import { GuildMessage } from '#lib/types/index';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { CommandOptions } from 'klasa';

@ApplyOptions<CommandOptions>({
	bucket: 2,
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Management.SetStarboardEmojiDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Management.SetStarboardEmojiExtended),
	permissionLevel: PermissionLevels.Administrator,
	runIn: ['text'],
	usage: '<emoji:emoji>'
})
export default class extends SkyraCommand {
	public async run(message: GuildMessage, [emoji]: [string]) {
		const language = await message.guild.writeSettings((settings) => {
			const language = settings.getLanguage();

			// If it's the same value, throw:
			if (settings[GuildSettings.Starboard.Emoji] === emoji) {
				throw language.get(LanguageKeys.Misc.ConfigurationEquals);
			}

			// Else set the new value:
			settings[GuildSettings.Starboard.Emoji] = emoji;

			return language;
		});

		return message.send(
			language.get(LanguageKeys.Commands.Management.SetStarboardEmojiSet, { emoji: emoji.includes(':') ? `<${emoji}>` : emoji })
		);
	}
}
