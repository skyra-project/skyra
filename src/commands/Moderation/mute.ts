import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationActions, SetUpModerationCommand } from '#lib/moderation';
import { getImage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import type { ArgumentTypes } from '@sapphire/utilities';
import { PermissionFlagsBits } from 'discord.js';

@ApplyOptions<SetUpModerationCommand.Options>({
	aliases: ['m'],
	description: LanguageKeys.Commands.Moderation.MuteDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.MuteExtended,
	optionalDuration: true,
	requiredClientPermissions: [PermissionFlagsBits.ManageRoles],
	requiredMember: true,
	actionKey: 'mute'
})
export class UserSetUpModerationCommand extends SetUpModerationCommand {
	public async handle(...[message, context]: ArgumentTypes<SetUpModerationCommand['handle']>) {
		return ModerationActions.mute.apply(
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
