import { writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { PermissionLevels, type GuildMessage } from '#lib/types';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Management.SetPrefixDescription,
	detailedDescription: LanguageKeys.Commands.Management.SetPrefixExtended,
	permissionLevel: PermissionLevels.Administrator,
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	aliases: ['prefix']
})
export class UserCommand extends SkyraCommand {
	public override async messageRun(message: GuildMessage, args: SkyraCommand.Args) {
		const prefix = await args.pick('string', { minimum: 1, maximum: 10 });
		await writeSettings(message.guild, (settings) => {
			// If it's the same value, throw:
			if (settings.prefix === prefix) {
				this.error(LanguageKeys.Misc.ConfigurationEquals);
			}

			// Else set the new value:
			settings.prefix = prefix;
		});

		const content = args.t(LanguageKeys.Commands.Management.SetPrefixSet, { prefix });
		return send(message, { content, allowedMentions: { users: [message.author.id], roles: [] } });
	}
}
