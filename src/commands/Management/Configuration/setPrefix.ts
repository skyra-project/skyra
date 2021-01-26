import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SkyraCommand.Options>({
	bucket: 2,
	cooldown: 10,
	description: LanguageKeys.Commands.Management.SetPrefixDescription,
	extendedHelp: LanguageKeys.Commands.Management.SetPrefixExtended,
	permissionLevel: PermissionLevels.Administrator,
	runIn: ['text'],
	usage: '<prefix:string{1,10}>',
	aliases: ['prefix']
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, [prefix]: [string]) {
		const t = await message.guild.writeSettings((settings) => {
			const t = settings.getLanguage();

			// If it's the same value, throw:
			if (settings[GuildSettings.Prefix] === prefix) {
				throw t(LanguageKeys.Misc.ConfigurationEquals);
			}

			// Else set the new value:
			settings[GuildSettings.Prefix] = prefix;

			return t;
		});

		return message.send(t(LanguageKeys.Commands.Management.SetPrefixSet, { prefix }), {
			allowedMentions: { users: [message.author.id], roles: [] }
		});
	}
}
