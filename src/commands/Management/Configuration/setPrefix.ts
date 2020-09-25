import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';

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
	public async run(message: KlasaMessage, [prefix]: [string]) {
		if (message.guild!.settings.get(GuildSettings.Prefix) === prefix) throw message.language.get('configurationEquals');
		await message.guild!.settings.update(GuildSettings.Prefix, prefix, {
			extraContext: { author: message.author.id }
		});
		return message.sendLocale(LanguageKeys.Commands.Management.SetPrefixSet, [{ prefix }], {
			allowedMentions: { users: [message.author.id], roles: [] }
		});
	}
}
