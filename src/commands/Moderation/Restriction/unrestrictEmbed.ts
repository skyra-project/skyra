import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationActions, SetUpModerationCommand } from '#lib/moderation';
import { ApplyOptions } from '@sapphire/decorators';
import type { ArgumentTypes } from '@sapphire/utilities';

@ApplyOptions<SetUpModerationCommand.Options>({
	aliases: ['un-restricted-embed', 'ure'],
	description: LanguageKeys.Commands.Moderation.UnrestrictEmbedDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.UnrestrictEmbedExtended,
	actionKey: 'restrictedEmbed'
})
export class UserSetUpModerationCommand extends SetUpModerationCommand {
	public async handle(...[message, context]: ArgumentTypes<SetUpModerationCommand['handle']>) {
		return ModerationActions.restrictedEmbed.undo(
			message.guild,
			{ user: context.target, moderator: message.author, reason: context.reason },
			await this.getActionData(message, context.args, context.target)
		);
	}
}
