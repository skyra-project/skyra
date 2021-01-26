import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SetUpModerationCommand } from '#lib/moderation';
import { ModerationSetupRestriction } from '#utils/Security/ModerationActions';
import { ApplyOptions } from '@sapphire/decorators';
import type { ArgumentTypes } from '@sapphire/utilities';

@ApplyOptions<SetUpModerationCommand.Options>({
	aliases: ['un-restricted-reaction', 'urr'],
	description: LanguageKeys.Commands.Moderation.UnrestrictReactionDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.UnrestrictReactionExtended,
	permissions: ['MANAGE_ROLES'],
	roleKey: GuildSettings.Roles.RestrictedReaction,
	setUpKey: ModerationSetupRestriction.Reaction
})
export class UserSetUpModerationCommand extends SetUpModerationCommand {
	public async handle(...[message, context]: ArgumentTypes<SetUpModerationCommand['handle']>) {
		return message.guild.security.actions.unRestrictReaction(
			{
				userID: context.target.id,
				moderatorID: message.author.id,
				reason: context.reason
			},
			await this.getTargetDM(message, context.args, context.target)
		);
	}
}
