import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationCommand } from '#lib/moderation';
import { getImage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import type { ArgumentTypes } from '@sapphire/utilities';

@ApplyOptions<ModerationCommand.Options>({
	aliases: ['w', 'warning'],
	description: LanguageKeys.Commands.Moderation.WarnDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.WarnExtended,
	optionalDuration: true,
	requiredMember: true
})
export class UserModerationCommand extends ModerationCommand {
	public async handle(...[message, context]: ArgumentTypes<ModerationCommand['handle']>) {
		return message.guild.security.actions.warning(
			{
				userId: context.target.id,
				moderatorId: message.author.id,
				reason: context.reason,
				imageURL: getImage(message),
				duration: context.duration
			},
			await this.getTargetDM(message, context.args, context.target)
		);
	}
}
