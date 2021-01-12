import { ModerationCommand, ModerationCommandOptions } from '#lib/structures/ModerationCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { getImage } from '#utils/util';
import { ArgumentTypes } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<ModerationCommandOptions>({
	aliases: ['vk'],
	description: LanguageKeys.Commands.Moderation.VoiceKickDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.VoiceKickExtended,
	requiredMember: true,
	requiredPermissions: ['MANAGE_CHANNELS', 'MOVE_MEMBERS']
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
