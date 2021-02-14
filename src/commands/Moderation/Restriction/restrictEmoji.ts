import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SetUpModerationCommand } from '#lib/moderation';
import { ModerationSetupRestriction } from '#utils/Security/ModerationActions';
import { getImage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import type { ArgumentTypes } from '@sapphire/utilities';

@ApplyOptions<SetUpModerationCommand.Options>({
	aliases: ['restrict-external-emoji', 'restricted-emoji', 'restricted-external-emoji', 'ree', 'restrict-emojis'],
	description: LanguageKeys.Commands.Moderation.RestrictEmojiDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.RestrictEmojiExtended,
	optionalDuration: true,
	requiredMember: true,
	permissions: ['MANAGE_ROLES'],
	roleKey: GuildSettings.Roles.RestrictedEmoji,
	setUpKey: ModerationSetupRestriction.Emoji
})
export class UserSetUpModerationCommand extends SetUpModerationCommand {
	public async handle(...[message, context]: ArgumentTypes<SetUpModerationCommand['handle']>) {
		return message.guild.security.actions.restrictEmoji(
			{
				userID: context.target.id,
				moderatorID: message.author.id,
				reason: context.reason,
				imageURL: getImage(message),
				duration: context.duration
			},
			await this.getTargetDM(message, context.args, context.target)
		);
	}
}
