import { ModerationCommand, ModerationCommandOptions } from '#lib/structures/ModerationCommand';
import { PermissionLevels } from '#lib/types/Enums';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { getImage } from '#utils/util';
import { ArgumentTypes } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<ModerationCommandOptions>({
	aliases: ['w', 'warning'],
	description: (language) => language.get(LanguageKeys.Commands.Moderation.WarnDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Moderation.WarnExtended),
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
