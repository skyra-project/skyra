import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationCommand, ModerationCommandOptions } from '#lib/structures/commands/ModerationCommand';
import { PermissionLevels } from '#lib/types/Enums';
import { getImage } from '#utils/util';
import type { ArgumentTypes } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<ModerationCommandOptions>({
	aliases: ['w', 'warning'],
	description: LanguageKeys.Commands.Moderation.WarnDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.WarnExtended,
	permissionLevel: PermissionLevels.Moderator,
	requiredMember: true,
	optionalDuration: true
})
export default class extends ModerationCommand {
	public async handle(...[message, context]: ArgumentTypes<ModerationCommand['handle']>) {
		return message.guild.security.actions.warning(
			{
				userID: context.target.id,
				moderatorID: message.author.id,
				reason: context.reason,
				imageURL: getImage(message),
				duration: context.duration
			},
			await this.getTargetDM(message, context.target)
		);
	}
}
