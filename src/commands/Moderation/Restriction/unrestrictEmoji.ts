import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SetUpModerationCommand } from '#lib/moderation';
import { ModerationSetupRestriction } from '#utils/Security/ModerationActions';
import { ApplyOptions } from '@sapphire/decorators';
import type { ArgumentTypes } from '@sapphire/utilities';

@ApplyOptions<SetUpModerationCommand.Options>({
	aliases: ['un-restrict-external-emoji', 'unrestricted-emoji', 'unrestricted-external-emoji', 'uree', 'unrestrict-emojis'],
	description: LanguageKeys.Commands.Moderation.UnrestrictEmojiDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.UnrestrictEmojiExtended,
	permissions: ['MANAGE_ROLES'],
	roleKey: GuildSettings.Roles.RestrictedEmoji,
	setUpKey: ModerationSetupRestriction.Emoji
})
export class UserSetUpModerationCommand extends SetUpModerationCommand {
	public async handle(...[message, context]: ArgumentTypes<SetUpModerationCommand['handle']>) {
		return message.guild.security.actions.unRestrictEmoji(
			{
				userID: context.target.id,
				moderatorID: message.author.id,
				reason: context.reason
			},
			await this.getTargetDM(message, context.args, context.target)
		);
	}
}
