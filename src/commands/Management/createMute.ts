import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { Emojis } from '#utils/constants';
import { resolveEmoji } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Argument, err, Result, UserError } from '@sapphire/framework';
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
	private get role() {
		return this.context.stores.get('arguments').get('role') as Argument<Role>;
	}

	public async run(message: GuildMessage, args: SkyraCommand.Args, context: SkyraCommand.Context) {
		const { t } = args;

		if (await message.ask(t(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupExisting))) {
			const role = await this.askForRole(message, args, context);
			if (role.success) {
				await message.guild.writeSettings([[GuildSettings.Roles.Muted, role.value.id]]);
				if (message.reactable) return message.react(resolveEmoji(Emojis.GreenTick)!);
				return message.send(
					t(LanguageKeys.Commands.Admin.ConfUpdated, {
						key: GuildSettings.Roles.Muted,
						response: role.value.name
					})
				);
			}
		} else if (await message.ask(t(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupNew))) {
			await message.guild.security.actions.muteSetup(message);
			await message.send(t(LanguageKeys.Commands.Moderation.Success));
		} else {
			await message.send(t(LanguageKeys.Commands.Management.CommandHandlerAborted));
		}

		return null;
	}

	private async askForRole(message: GuildMessage, args: SkyraCommand.Args, context: SkyraCommand.Context): Promise<Result<Role, UserError>> {
		const response = await message.prompt(args.t(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupExistingName), 30000).catch(() => null);
		// TODO: (sapphire migration) i18n identifier
		if (response === null) return err(new UserError({ identifier: 'TODO' }));

		const argument = this.role;
		return argument.run(response.content, { args, argument, command: this, commandContext: context, message });
	}
}
