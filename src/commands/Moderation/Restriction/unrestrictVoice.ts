import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SetUpModerationCommand } from '#lib/moderation';
import { ModerationSetupRestriction } from '#utils/Security/ModerationActions';
import { ApplyOptions } from '@sapphire/decorators';
import type { ArgumentTypes } from '@sapphire/utilities';

@ApplyOptions<SetUpModerationCommand.Options>({
	aliases: ['un-restricted-voice', 'urv'],
	description: LanguageKeys.Commands.Moderation.UnrestrictVoiceDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.UnrestrictVoiceExtended,
	requiredClientPermissions: ['MANAGE_ROLES'],
	roleKey: GuildSettings.Roles.RestrictedVoice,
	setUpKey: ModerationSetupRestriction.Voice
})
export class UserSetUpModerationCommand extends SetUpModerationCommand {
	public async handle(...[message, context]: ArgumentTypes<SetUpModerationCommand['handle']>) {
		return message.guild.security.actions.unRestrictVoice(
			{
				userId: context.target.id,
				moderatorId: message.author.id,
				reason: context.reason
			},
			await this.getTargetDM(message, context.args, context.target)
		);
	}
}
