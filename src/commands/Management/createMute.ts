import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { Emojis } from '#utils/constants';
import { resolveEmoji } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Permissions, Role } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	cooldown: 150,
	description: LanguageKeys.Commands.Management.CreateMuteDescription,
	extendedHelp: LanguageKeys.Commands.Management.CreateMuteExtended,
	permissionLevel: PermissionLevels.Administrator,
	permissions: [Permissions.FLAGS.MANAGE_CHANNELS, Permissions.FLAGS.MANAGE_ROLES],
	runIn: ['text']
})
export class UserCommand extends SkyraCommand {
	// eslint-disable-next-line @typescript-eslint/no-invalid-this
	private rolePrompt = this.definePrompt('<role:rolename>');

	public async run(message: GuildMessage) {
		const t = await message.fetchT();

		if (await message.ask(t(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupExisting))) {
			const [role] = (await this.rolePrompt
				.createPrompt(message, { time: 30000, limit: 1 })
				.run(t(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupExistingName))) as [Role];

			await message.guild.writeSettings([[GuildSettings.Roles.Muted, role.id]]);
			if (message.reactable) return message.react(resolveEmoji(Emojis.GreenTick)!);
			return message.send(
				t(LanguageKeys.Commands.Admin.ConfUpdated, {
					key: GuildSettings.Roles.Muted,
					response: role.name
				})
			);
		} else if (await message.ask(t(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupNew))) {
			await message.guild.security.actions.muteSetup(message);
			await message.send(t(LanguageKeys.Commands.Moderation.Success));
		} else {
			await message.send(t(LanguageKeys.Monitors.CommandHandlerAborted));
		}

		return null;
	}
}
