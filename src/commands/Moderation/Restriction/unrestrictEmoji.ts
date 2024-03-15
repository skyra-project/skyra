import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationActions, SetUpModerationCommand } from '#lib/moderation';
import { ApplyOptions } from '@sapphire/decorators';
import type { ArgumentTypes } from '@sapphire/utilities';

@ApplyOptions<SetUpModerationCommand.Options>({
	aliases: ['un-restrict-external-emoji', 'unrestricted-emoji', 'unrestricted-external-emoji', 'uree', 'unrestrict-emojis'],
	description: LanguageKeys.Commands.Moderation.UnrestrictEmojiDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.UnrestrictEmojiExtended,
	actionKey: 'restrictedEmoji'
})
export class UserSetUpModerationCommand extends SetUpModerationCommand {
	public async handle(...[message, context]: ArgumentTypes<SetUpModerationCommand['handle']>) {
		return ModerationActions.restrictedEmoji.undo(
			message.guild,
			{ userId: context.target.id, moderatorId: message.author.id, reason: context.reason },
			await this.getActionData(message, context.args, context.target)
		);
	}
}
