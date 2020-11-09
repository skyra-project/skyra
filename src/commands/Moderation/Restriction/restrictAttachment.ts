import { GuildSettings } from '@lib/database';
import { ModerationCommand, ModerationCommandOptions } from '@lib/structures/ModerationCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ArgumentTypes } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { ModerationSetupRestriction } from '@utils/Security/ModerationActions';
import { getImage } from '@utils/util';
import { Role } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<ModerationCommandOptions>({
	aliases: ['restricted-attachment', 'ra'],
	description: (language) => language.get(LanguageKeys.Commands.Moderation.RestrictAttachmentDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Moderation.RestrictAttachmentExtended),
	optionalDuration: true,
	requiredMember: true,
	requiredGuildPermissions: ['MANAGE_ROLES']
})
export default class extends ModerationCommand {
	// eslint-disable-next-line @typescript-eslint/no-invalid-this
	private rolePrompt = this.definePrompt('<role:rolename>');

	public async inhibit(message: KlasaMessage) {
		// If the command run is not this one (potentially help command) or the guild is null, return with no error.
		if (message.command !== this || message.guild === null) return false;
		const [id, language] = await message.guild.readSettings((settings) => [
			settings[GuildSettings.Roles.RestrictedAttachment],
			settings.getLanguage()
		]);

		const role = (id && message.guild.roles.cache.get(id)) || null;
		if (!role) {
			if (!(await message.hasAtLeastPermissionLevel(PermissionLevels.Administrator))) {
				throw language.get(LanguageKeys.Commands.Moderation.RestrictLowlevel);
			}

			if (await message.ask(language.get(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupExisting))) {
				const [role] = (await this.rolePrompt
					.createPrompt(message, { time: 30000, limit: 1 })
					.run(language.get(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupExistingName))) as [Role];

				await message.guild.writeSettings([[GuildSettings.Roles.RestrictedAttachment, role.id]]);
			} else if (await message.ask(language.get(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupNew))) {
				await message.guild.security.actions.restrictionSetup(message, ModerationSetupRestriction.Attachment);
				await message.sendLocale(LanguageKeys.Misc.CommandSuccess);
			} else {
				await message.sendLocale(LanguageKeys.Monitors.CommandHandlerAborted);
			}
		}

		return false;
	}

	public async prehandle() {
		/* Do nothing */
	}

	public async handle(...[message, context]: ArgumentTypes<ModerationCommand['handle']>) {
		return message.guild.security.actions.restrictAttachment(
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

	public async posthandle() {
		/* Do nothing */
	}
}
