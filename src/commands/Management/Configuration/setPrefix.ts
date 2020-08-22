import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	bucket: 2,
	cooldown: 10,
	description: (language) => language.get('COMMAND_SETPREFIX_DESCRIPTION'),
	extendedHelp: (language) => language.get('COMMAND_SETPREFIX_EXTENDED'),
	permissionLevel: PermissionLevels.Administrator,
	runIn: ['text'],
	usage: '<prefix:string{1,10}>',
	aliases: ['prefix']
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [prefix]: [string]) {
		if (message.guild!.settings.get(GuildSettings.Prefix) === prefix) throw message.language.get('CONFIGURATION_EQUALS');
		await message.guild!.settings.update(GuildSettings.Prefix, prefix, {
			extraContext: { author: message.author.id }
		});
		return message.sendLocale('COMMAND_SETPREFIX_SET', [{ prefix }]);
	}
}
