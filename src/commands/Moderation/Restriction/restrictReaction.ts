import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationActions, SetUpModerationCommand } from '#lib/moderation';
import { getImage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import type { ArgumentTypes } from '@sapphire/utilities';

@ApplyOptions<SetUpModerationCommand.Options>({
	aliases: ['restricted-reaction', 'rr'],
	description: LanguageKeys.Commands.Moderation.RestrictReactionDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.RestrictReactionExtended,
	optionalDuration: true,
	requiredMember: true,
	actionKey: 'restrictedReaction'
})
export class UserSetUpModerationCommand extends SetUpModerationCommand {
	public async handle(...[message, context]: ArgumentTypes<SetUpModerationCommand['handle']>) {
		return ModerationActions.restrictedReaction.apply(
			message.guild,
			{ user: context.target, moderator: message.author, reason: context.reason, imageURL: getImage(message), duration: context.duration },
			await this.getActionData(message, context.args, context.target)
		);
	}
}
