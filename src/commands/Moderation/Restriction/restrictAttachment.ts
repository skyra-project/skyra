import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationActions, SetUpModerationCommand } from '#lib/moderation';
import { getImage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import type { ArgumentTypes } from '@sapphire/utilities';

@ApplyOptions<SetUpModerationCommand.Options>({
	aliases: ['restricted-attachment', 'ra'],
	description: LanguageKeys.Commands.Moderation.RestrictAttachmentDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.RestrictAttachmentExtended,
	optionalDuration: true,
	requiredMember: true,
	actionKey: 'restrictedAttachment'
})
export class UserSetUpModerationCommand extends SetUpModerationCommand {
	public async handle(...[message, context]: ArgumentTypes<SetUpModerationCommand['handle']>) {
		return ModerationActions.restrictedAttachment.apply(
			message.guild,
			{
				userId: context.target.id,
				moderatorId: message.author.id,
				reason: context.reason,
				imageURL: getImage(message),
				duration: context.duration
			},
			await this.getActionData(message, context.args, context.target)
		);
	}
}
