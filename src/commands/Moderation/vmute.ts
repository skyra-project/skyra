import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationCommand } from '#lib/structures';
import { getImage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import type { ArgumentTypes } from '@sapphire/utilities';

@ApplyOptions<ModerationCommand.Options>({
	aliases: ['vm'],
	description: LanguageKeys.Commands.Moderation.VmuteDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.VmuteExtended,
	optionalDuration: true,
	requiredMember: true,
	permissions: ['MUTE_MEMBERS']
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

	public async checkModeratable(...[message, t, context]: ArgumentTypes<ModerationCommand['checkModeratable']>) {
		const member = await super.checkModeratable(message, t, context);
		if (member && member.voice.serverMute) throw t(LanguageKeys.Commands.Moderation.MuteMuted);
		return member;
	}
}
