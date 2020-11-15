import { GuildSettings } from '@lib/database';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { GuildMessage } from '@lib/types';
import { PermissionLevels } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { Emojis } from '@utils/constants';
import { resolveEmoji } from '@utils/util';
import { Permissions, Role } from 'discord.js';

@ApplyOptions<SkyraCommandOptions>({
	cooldown: 150,
	description: (language) => language.get(LanguageKeys.Commands.Management.CreateMuteDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Management.CreateMuteExtended),
	permissionLevel: PermissionLevels.Administrator,
	requiredGuildPermissions: [Permissions.FLAGS.MANAGE_CHANNELS, Permissions.FLAGS.MANAGE_ROLES],
	runIn: ['text']
})
export default class extends SkyraCommand {
	// eslint-disable-next-line @typescript-eslint/no-invalid-this
	private rolePrompt = this.definePrompt('<role:rolename>');

	public async run(message: GuildMessage) {
		const language = await message.fetchLanguage();

		if (await message.ask(language.get(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupExisting))) {
			const [role] = (await this.rolePrompt
				.createPrompt(message, { time: 30000, limit: 1 })
				.run(language.get(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupExistingName))) as [Role];

			await message.guild.writeSettings([[GuildSettings.Roles.Muted, role.id]]);
			if (message.reactable) return message.react(resolveEmoji(Emojis.GreenTick)!);
			return message.sendLocale(LanguageKeys.Commands.Admin.ConfUpdated, [
				{
					key: GuildSettings.Roles.Muted,
					response: role.name
				}
			]);
		} else if (await message.ask(language.get(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupNew))) {
			await message.guild.security.actions.muteSetup(message);
			await message.sendLocale(LanguageKeys.Misc.CommandSuccess);
		} else {
			await message.sendLocale(LanguageKeys.Monitors.CommandHandlerAborted);
		}

		return null;
	}
}
