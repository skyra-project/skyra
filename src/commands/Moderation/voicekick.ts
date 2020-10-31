import { ModerationCommand, ModerationCommandOptions } from '@lib/structures/ModerationCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ArgumentTypes } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { getImage } from '@utils/util';

@ApplyOptions<ModerationCommandOptions>({
	aliases: ['vk'],
	description: (language) => language.get(LanguageKeys.Commands.Moderation.VoiceKickDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Moderation.VoiceKickExtended),
	requiredMember: true,
	requiredPermissions: ['MANAGE_CHANNELS', 'MOVE_MEMBERS']
})
export default class extends ModerationCommand {
	public async prehandle() {
		/* Do nothing */
	}

	public async handle(...[message, context]: ArgumentTypes<ModerationCommand['handle']>) {
		return message.guild!.security.actions.voiceKick(
			{
				userID: context.target.id,
				moderatorID: message.author.id,
				reason: context.reason,
				imageURL: getImage(message)
			},
			await this.getTargetDM(message, context.target)
		);
	}

	public async posthandle() {
		/* Do nothing */
	}

	public async checkModeratable(...[message, context]: ArgumentTypes<ModerationCommand['checkModeratable']>) {
		const member = await super.checkModeratable(message, context);
		if (member && !member.voice.channelID) throw message.fetchLocale(LanguageKeys.Commands.Moderation.GuildMemberNotVoicechannel);
		return member;
	}
}
