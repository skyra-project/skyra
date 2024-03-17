import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationActions, SetUpModerationCommand } from '#lib/moderation';
import { getImage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import type { ArgumentTypes } from '@sapphire/utilities';

@ApplyOptions<SetUpModerationCommand.Options>({
	aliases: ['restrict-external-emoji', 'restricted-emoji', 'restricted-external-emoji', 'ree', 'restrict-emojis'],
	description: LanguageKeys.Commands.Moderation.RestrictEmojiDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.RestrictEmojiExtended,
	optionalDuration: true,
	requiredMember: true,
	actionKey: 'restrictedEmoji'
})
export class UserSetUpModerationCommand extends SetUpModerationCommand {
	public async handle(...[message, context]: ArgumentTypes<SetUpModerationCommand['handle']>) {
		return ModerationActions.restrictedEmoji.apply(
			message.guild,
			{ user: context.target, moderator: message.author, reason: context.reason, imageURL: getImage(message), duration: context.duration },
			await this.getActionData(message, context.args, context.target)
		);
	}
}
