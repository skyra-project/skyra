import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SetUpModerationCommand } from '#lib/moderation';
import { getSecurity } from '#utils/functions';
import { ModerationSetupRestriction } from '#utils/Security/ModerationActions';
import { ApplyOptions } from '@sapphire/decorators';
import type { ArgumentTypes } from '@sapphire/utilities';
import { PermissionFlagsBits } from 'discord.js';

@ApplyOptions<SetUpModerationCommand.Options>({
	aliases: ['un-restricted-embed', 'ure'],
	description: LanguageKeys.Commands.Moderation.UnrestrictEmbedDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.UnrestrictEmbedExtended,
	requiredClientPermissions: [PermissionFlagsBits.ManageRoles],
	roleKey: GuildSettings.Roles.RestrictedEmbed,
	setUpKey: ModerationSetupRestriction.Embed
})
export class UserSetUpModerationCommand extends SetUpModerationCommand {
	public async handle(...[message, context]: ArgumentTypes<SetUpModerationCommand['handle']>) {
		return getSecurity(message.guild).actions.unRestrictEmbed(
			{
				userId: context.target.id,
				moderatorId: message.author.id,
				reason: context.reason
			},
			await this.getTargetDM(message, context.args, context.target)
		);
	}
}
