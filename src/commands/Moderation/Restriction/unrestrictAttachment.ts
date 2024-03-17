import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationActions, SetUpModerationCommand } from '#lib/moderation';
import { ApplyOptions } from '@sapphire/decorators';
import type { ArgumentTypes } from '@sapphire/utilities';

@ApplyOptions<SetUpModerationCommand.Options>({
	aliases: ['un-restricted-attachment', 'ura'],
	description: LanguageKeys.Commands.Moderation.UnrestrictAttachmentDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.UnrestrictAttachmentExtended,
	actionKey: 'restrictedAttachment'
})
export class UserSetUpModerationCommand extends SetUpModerationCommand {
	public async handle(...[message, context]: ArgumentTypes<SetUpModerationCommand['handle']>) {
		return ModerationActions.restrictedAttachment.undo(
			message.guild,
			{ user: context.target, moderator: message.author, reason: context.reason },
			await this.getActionData(message, context.args, context.target)
		);
	}
}
