import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationCommand } from '#lib/structures';
import { getImage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import type { ArgumentTypes } from '@sapphire/utilities';

@ApplyOptions<ModerationCommand.Options>({
	aliases: ['vk'],
	description: LanguageKeys.Commands.Moderation.VoiceKickDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.VoiceKickExtended,
	requiredMember: true,
	permissions: ['MANAGE_CHANNELS', 'MOVE_MEMBERS']
})
export default class extends ModerationCommand {
	public async handle(...[message, context]: ArgumentTypes<ModerationCommand['handle']>) {
		return message.guild.security.actions.voiceKick(
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
		if (member && !member.voice.channelID) throw t(LanguageKeys.Commands.Moderation.GuildMemberNotVoicechannel);
		return member;
	}
}
