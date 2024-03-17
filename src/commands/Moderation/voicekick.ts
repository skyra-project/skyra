import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationActions, ModerationCommand } from '#lib/moderation';
import { getImage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import type { ArgumentTypes } from '@sapphire/utilities';
import { PermissionFlagsBits } from 'discord.js';

@ApplyOptions<ModerationCommand.Options>({
	aliases: ['vk', 'vkick'],
	description: LanguageKeys.Commands.Moderation.VoiceKickDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.VoiceKickExtended,
	requiredClientPermissions: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MoveMembers],
	requiredMember: true
})
export class UserModerationCommand extends ModerationCommand {
	public async handle(...[message, context]: ArgumentTypes<ModerationCommand['handle']>) {
		return ModerationActions.voiceKick.apply(
			message.guild,
			{ user: context.target, moderator: message.author, reason: context.reason, imageURL: getImage(message) },
			await this.getActionData(message, context.args, context.target)
		);
	}

	public override async checkModeratable(...[message, context]: ArgumentTypes<ModerationCommand['checkModeratable']>) {
		const member = await super.checkModeratable(message, context);
		if (member && !member.voice.channelId) throw context.args.t(LanguageKeys.Commands.Moderation.GuildMemberNotVoicechannel);
		return member;
	}
}
