import { GuildSettings, writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationActions } from '#lib/moderation';
import { SkyraCommand } from '#lib/structures';
import { PermissionLevels, type GuildMessage } from '#lib/types';
import { minutes } from '#utils/common';
import { Emojis } from '#utils/constants';
import { getEmojiReactionFormat, promptConfirmation, promptForMessage, type SerializedEmoji } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { canReact } from '@sapphire/discord.js-utilities';
import { Argument, CommandOptionsRunTypeEnum, Result, UserError } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits, type Role } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	cooldownDelay: minutes(5),
	description: LanguageKeys.Commands.Management.CreateMuteDescription,
	detailedDescription: LanguageKeys.Commands.Management.CreateMuteExtended,
	permissionLevel: PermissionLevels.Administrator,
	requiredClientPermissions: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles],
	runIn: [CommandOptionsRunTypeEnum.GuildAny]
})
export class UserCommand extends SkyraCommand {
	private get role() {
		return this.container.stores.get('arguments').get('role') as Argument<Role>;
	}

	public override async messageRun(message: GuildMessage, args: SkyraCommand.Args, context: SkyraCommand.RunContext) {
		const { t } = args;

		if (await promptConfirmation(message, t(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupExisting))) {
			const result = await this.askForRole(message, args, context);
			if (result.isOk()) {
				const role = result.unwrap();
				await writeSettings(message.guild, [[GuildSettings.Roles.Muted, role.id]]);
				if (canReact(message.channel)) return message.react(getEmojiReactionFormat(Emojis.GreenTickSerialized as SerializedEmoji));

				const content = t(LanguageKeys.Commands.Admin.ConfUpdated, {
					key: GuildSettings.Roles.Muted,
					response: role.name
				});
				return send(message, content);
			}
		} else if (await promptConfirmation(message, t(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupNew))) {
			await ModerationActions.mute.setup(message);

			const content = t(LanguageKeys.Commands.Moderation.Success);
			await send(message, content);
		} else {
			const content = t(LanguageKeys.Commands.Management.CommandHandlerAborted);
			await send(message, content);
		}

		return null;
	}

	private async askForRole(message: GuildMessage, args: SkyraCommand.Args, context: SkyraCommand.RunContext): Promise<Result<Role, UserError>> {
		const result = await promptForMessage(message, args.t(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupExistingName));
		if (result === null) this.error(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupNoMessage);

		const argument = this.role;
		return argument.run(result, { args, argument, command: this, commandContext: context, message });
	}
}
