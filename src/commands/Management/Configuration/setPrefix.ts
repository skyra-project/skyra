import { GuildSettings, writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Management.SetPrefixDescription,
	extendedHelp: LanguageKeys.Commands.Management.SetPrefixExtended,
	permissionLevel: PermissionLevels.Administrator,
	runIn: ['GUILD_ANY'],
	aliases: ['prefix']
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const prefix = await args.pick('string', { minimum: 1, maximum: 10 });
		await writeSettings(message.guild, (settings) => {
			// If it's the same value, throw:
			if (settings[GuildSettings.Prefix] === prefix) {
				this.error(LanguageKeys.Misc.ConfigurationEquals);
			}

			// Else set the new value:
			settings[GuildSettings.Prefix] = prefix;
		});

		return message.send(args.t(LanguageKeys.Commands.Management.SetPrefixSet, { prefix }), {
			allowedMentions: { users: [message.author.id], roles: [] }
		});
	}
}
