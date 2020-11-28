import { GuildSettings } from '#lib/database/index';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { PermissionLevels } from '#lib/types/Enums';
import { GuildMessage } from '#lib/types/index';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<SkyraCommandOptions>({
	bucket: 2,
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Management.SetprefixDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Management.SetprefixExtended),
	permissionLevel: PermissionLevels.Administrator,
	runIn: ['text'],
	usage: '<prefix:string{1,10}>',
	aliases: ['prefix']
})
export default class extends SkyraCommand {
	public async run(message: GuildMessage, [prefix]: [string]) {
		const language = await message.guild.writeSettings((settings) => {
			const language = settings.getLanguage();

			// If it's the same value, throw:
			if (settings[GuildSettings.Prefix] === prefix) {
				throw language.get(LanguageKeys.Misc.ConfigurationEquals);
			}

			// Else set the new value:
			settings[GuildSettings.Prefix] = prefix;

			return language;
		});

		return message.send(language.get(LanguageKeys.Commands.Management.SetPrefixSet, { prefix }), {
			allowedMentions: { users: [message.author.id], roles: [] }
		});
	}
}
