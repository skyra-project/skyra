import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationCommand } from '#lib/structures/commands/ModerationCommand';
import { getImage } from '#utils/util';
import type { ArgumentTypes } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<ModerationCommand.Options>({
	aliases: ['uvm', 'vum', 'unvmute'],
	description: LanguageKeys.Commands.Moderation.VunmuteDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.VunmuteExtended,
	requiredMember: true,
	requiredPermissions: ['MUTE_MEMBERS']
})
export default class extends ModerationCommand {
	public async handle(...[message, context]: ArgumentTypes<ModerationCommand['handle']>) {
		return message.guild.security.actions.unVoiceMute(
			{
				userID: context.target.id,
				moderatorID: message.author.id,
				reason: context.reason,
				imageURL: getImage(message)
			},
			await this.getTargetDM(message, context.target)
		);
	}

	public async checkModeratable(...[message, t, context]: ArgumentTypes<ModerationCommand['checkModeratable']>) {
		const member = await super.checkModeratable(message, t, context);
		if (member && !member.voice.serverMute) throw t(LanguageKeys.Commands.Moderation.VmuteUserNotMuted);
		return member;
	}
}
