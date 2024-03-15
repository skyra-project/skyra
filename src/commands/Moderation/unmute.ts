import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationActions, ModerationCommand, SetUpModerationCommand } from '#lib/moderation';
import { getImage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import type { ArgumentTypes } from '@sapphire/utilities';

@ApplyOptions<SetUpModerationCommand.Options>({
	aliases: ['um'],
	description: LanguageKeys.Commands.Moderation.UnmuteDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.UnmuteExtended,
	actionKey: 'mute'
})
export class UserSetUpModerationCommand extends SetUpModerationCommand {
	public async handle(...[message, context]: ArgumentTypes<ModerationCommand['handle']>) {
		return ModerationActions.mute.undo(
			message.guild,
			{ userId: context.target.id, moderatorId: message.author.id, reason: context.reason, imageURL: getImage(message) },
			await this.getActionData(message, context.args, context.target)
		);
	}
}
