import { ModerationCommand, ModerationCommandOptions } from '#lib/structures/ModerationCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { getImage } from '#utils/util';
import { ArgumentTypes } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<ModerationCommandOptions>({
	aliases: ['vm'],
	description: (language) => language.get(LanguageKeys.Commands.Moderation.VmuteDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Moderation.VmuteExtended),
	optionalDuration: true,
	requiredMember: true,
	requiredGuildPermissions: ['MUTE_MEMBERS']
})
export default class extends ModerationCommand {
	public async handle(...[message, context]: ArgumentTypes<ModerationCommand['handle']>) {
		return message.guild.security.actions.voiceMute(
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

	public async checkModeratable(...[message, language, context]: ArgumentTypes<ModerationCommand['checkModeratable']>) {
		const member = await super.checkModeratable(message, language, context);
		if (member && member.voice.serverMute) throw language.get(LanguageKeys.Commands.Moderation.MuteMuted);
		return member;
	}
}
