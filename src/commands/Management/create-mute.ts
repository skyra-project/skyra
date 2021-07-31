import { GuildSettings, writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { Emojis } from '#utils/constants';
import { canReact, promptConfirmation, promptForMessage } from '#utils/functions';
import { resolveEmoji } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import type { Argument, Result, UserError } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import { Permissions, Role } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	cooldownDelay: Time.Minute * 5,
	description: LanguageKeys.Commands.Management.CreateMuteDescription,
	extendedHelp: LanguageKeys.Commands.Management.CreateMuteExtended,
	permissionLevel: PermissionLevels.Administrator,
	requiredClientPermissions: [Permissions.FLAGS.MANAGE_CHANNELS, Permissions.FLAGS.MANAGE_ROLES],
	runIn: ['GUILD_ANY']
})
export class UserCommand extends SkyraCommand {
	private get role() {
		return this.container.stores.get('arguments').get('role') as Argument<Role>;
	}

	public async run(message: GuildMessage, args: SkyraCommand.Args, context: SkyraCommand.Context) {
		const { t } = args;

		if (await promptConfirmation(message, t(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupExisting))) {
			const role = await this.askForRole(message, args, context);
			if (role.success) {
				await writeSettings(message.guild, [[GuildSettings.Roles.Muted, role.value.id]]);
				if (canReact(message)) return message.react(resolveEmoji(Emojis.GreenTick)!);
				return message.send(
					t(LanguageKeys.Commands.Admin.ConfUpdated, {
						key: GuildSettings.Roles.Muted,
						response: role.value.name
					})
				);
			}
		} else if (await promptConfirmation(message, t(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupNew))) {
			await message.guild.security.actions.muteSetup(message);
			await message.send(t(LanguageKeys.Commands.Moderation.Success));
		} else {
			await message.send(t(LanguageKeys.Commands.Management.CommandHandlerAborted));
		}

		return null;
	}

	private async askForRole(message: GuildMessage, args: SkyraCommand.Args, context: SkyraCommand.Context): Promise<Result<Role, UserError>> {
		const result = await promptForMessage(message, args.t(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupExistingName));
		if (result === null) this.error(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupNoMessage);

		const argument = this.role;
		return argument.run(result, { args, argument, command: this, commandContext: context, message });
	}
}
