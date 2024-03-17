import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationActions, SetUpModerationCommand } from '#lib/moderation';
import { ApplyOptions } from '@sapphire/decorators';
import type { ArgumentTypes } from '@sapphire/utilities';

@ApplyOptions<SetUpModerationCommand.Options>({
	aliases: ['un-restricted-reaction', 'urr'],
	description: LanguageKeys.Commands.Moderation.UnrestrictReactionDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.UnrestrictReactionExtended,
	actionKey: 'restrictedReaction'
})
export class UserSetUpModerationCommand extends SetUpModerationCommand {
	public async handle(...[message, context]: ArgumentTypes<SetUpModerationCommand['handle']>) {
		return ModerationActions.restrictedReaction.undo(
			message.guild,
			{ user: context.target, moderator: message.author, reason: context.reason },
			await this.getActionData(message, context.args, context.target)
		);
	}
}
