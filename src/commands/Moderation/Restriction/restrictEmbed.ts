import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationCommand } from '#lib/structures/commands/ModerationCommand';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { ModerationSetupRestriction } from '#utils/Security/ModerationActions';
import { getImage } from '#utils/util';
import type { ArgumentTypes } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import type { Role } from 'discord.js';

@ApplyOptions<ModerationCommand.Options>({
	aliases: ['restricted-embed', 're'],
	description: LanguageKeys.Commands.Moderation.RestrictEmbedDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.RestrictEmbedExtended,
	optionalDuration: true,
	requiredMember: true,
	requiredGuildPermissions: ['MANAGE_ROLES']
})
export default class extends ModerationCommand {
	// eslint-disable-next-line @typescript-eslint/no-invalid-this
	private rolePrompt = this.definePrompt('<role:rolename>');

	public async inhibit(message: GuildMessage) {
		// If the command run is not this one (potentially help command) or the guild is null, return with no error.
		if (message.command !== this || message.guild === null) return false;
		const [id, t] = await message.guild.readSettings((settings) => [settings[GuildSettings.Roles.RestrictedEmbed], settings.getLanguage()]);

		const role = (id && message.guild.roles.cache.get(id)) || null;
		if (!role) {
			if (!(await message.hasAtLeastPermissionLevel(PermissionLevels.Administrator)))
				throw t(LanguageKeys.Commands.Moderation.RestrictLowlevel);
			if (await message.ask(t(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupExisting))) {
				const [role] = (await this.rolePrompt
					.createPrompt(message, { time: 30000, limit: 1 })
					.run(t(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupExistingName))) as [Role];

				await message.guild.writeSettings([[GuildSettings.Roles.RestrictedEmbed, role.id]]);
			} else if (await message.ask(t(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupNew))) {
				await message.guild.security.actions.restrictionSetup(message, ModerationSetupRestriction.Embed);
				await message.send(t(LanguageKeys.Commands.Moderation.Success));
			} else {
				await message.send(t(LanguageKeys.Monitors.CommandHandlerAborted));
			}
		}

		return false;
	}

	public async handle(...[message, context]: ArgumentTypes<ModerationCommand['handle']>) {
		return message.guild.security.actions.restrictEmbed(
			{
				userID: context.target.id,
				moderatorID: message.author.id,
				reason: context.reason,
				imageURL: getImage(message),
				duration: context.duration
			},
			await this.getTargetDM(message, context.target)
		);
	}
}
