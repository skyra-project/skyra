import { GuildSettings } from '#lib/database/index';
import { ModerationCommand, ModerationCommandOptions } from '#lib/structures/ModerationCommand';
import { PermissionLevels } from '#lib/types/Enums';
import { GuildMessage } from '#lib/types/index';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ModerationSetupRestriction } from '#utils/Security/ModerationActions';
import { getImage } from '#utils/util';
import { ArgumentTypes } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { Role } from 'discord.js';

@ApplyOptions<ModerationCommandOptions>({
	aliases: ['restricted-embed', 're'],
	description: (language) => language.get(LanguageKeys.Commands.Moderation.RestrictEmbedDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Moderation.RestrictEmbedExtended),
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
		const [id, language] = await message.guild.readSettings((settings) => [
			settings[GuildSettings.Roles.RestrictedEmbed],
			settings.getLanguage()
		]);

		const role = (id && message.guild.roles.cache.get(id)) || null;
		if (!role) {
			if (!(await message.hasAtLeastPermissionLevel(PermissionLevels.Administrator)))
				throw language.get(LanguageKeys.Commands.Moderation.RestrictLowlevel);
			if (await message.ask(language.get(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupExisting))) {
				const [role] = (await this.rolePrompt
					.createPrompt(message, { time: 30000, limit: 1 })
					.run(language.get(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupExistingName))) as [Role];

				await message.guild.writeSettings([[GuildSettings.Roles.RestrictedEmbed, role.id]]);
			} else if (await message.ask(language.get(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupNew))) {
				await message.guild.security.actions.restrictionSetup(message, ModerationSetupRestriction.Embed);
				await message.sendLocale(LanguageKeys.Misc.CommandSuccess);
			} else {
				await message.sendLocale(LanguageKeys.Monitors.CommandHandlerAborted);
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
