import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SetUpModerationCommand } from '#lib/moderation';
import { PermissionFlags } from '#utils/constants';
import { getSecurity } from '#utils/functions';
import { ModerationSetupRestriction } from '#utils/Security/ModerationActions';
import { getImage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import type { ArgumentTypes } from '@sapphire/utilities';

@ApplyOptions<SetUpModerationCommand.Options>({
	aliases: ['restricted-voice', 'rv'],
	description: LanguageKeys.Commands.Moderation.RestrictVoiceDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.RestrictVoiceExtended,
	optionalDuration: true,
	requiredMember: true,
	requiredClientPermissions: [PermissionFlags.MANAGE_ROLES],
	roleKey: GuildSettings.Roles.RestrictedVoice,
	setUpKey: ModerationSetupRestriction.Voice
})
export class UserSetUpModerationCommand extends SetUpModerationCommand {
	public async handle(...[message, context]: ArgumentTypes<SetUpModerationCommand['handle']>) {
		return getSecurity(message.guild).actions.restrictVoice(
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
