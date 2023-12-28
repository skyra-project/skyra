import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SetUpModerationCommand } from '#lib/moderation';
import { getSecurity } from '#utils/functions';
import { ModerationSetupRestriction } from '#utils/Security/ModerationActions';
import { ApplyOptions } from '@sapphire/decorators';
import type { ArgumentTypes } from '@sapphire/utilities';
import { PermissionFlagsBits } from 'discord.js';

@ApplyOptions<SetUpModerationCommand.Options>({
	aliases: ['un-restricted-attachment', 'ura'],
	description: LanguageKeys.Commands.Moderation.UnrestrictAttachmentDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.UnrestrictAttachmentExtended,
	requiredClientPermissions: [PermissionFlagsBits.ManageRoles],
	roleKey: GuildSettings.Roles.RestrictedAttachment,
	setUpKey: ModerationSetupRestriction.Attachment
})
export class UserSetUpModerationCommand extends SetUpModerationCommand {
	public async handle(...[message, context]: ArgumentTypes<SetUpModerationCommand['handle']>) {
		return getSecurity(message.guild).actions.unRestrictAttachment(
			{
				userId: context.target.id,
				moderatorId: message.author.id,
				reason: context.reason
			},
			await this.getTargetDM(message, context.args, context.target)
		);
	}
}
