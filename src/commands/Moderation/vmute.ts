import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationActions, ModerationCommand } from '#lib/moderation';
import { getImage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import type { ArgumentTypes } from '@sapphire/utilities';
import { PermissionFlagsBits } from 'discord.js';

@ApplyOptions<ModerationCommand.Options>({
	aliases: ['vm'],
	description: LanguageKeys.Commands.Moderation.VmuteDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.VmuteExtended,
	optionalDuration: true,
	requiredClientPermissions: [PermissionFlagsBits.MuteMembers],
	requiredMember: true
})
export class UserModerationCommand extends ModerationCommand {
	public async handle(...[message, context]: ArgumentTypes<ModerationCommand['handle']>) {
		return ModerationActions.voiceMute.apply(
			message.guild,
			{ user: context.target, moderator: message.author, reason: context.reason, imageURL: getImage(message), duration: context.duration },
			await this.getActionData(message, context.args, context.target)
		);
	}

	public override async checkModeratable(...[message, context]: ArgumentTypes<ModerationCommand['checkModeratable']>) {
		const member = await super.checkModeratable(message, context);
		if (member && member.voice.serverMute) throw context.args.t(LanguageKeys.Commands.Moderation.MuteMuted);
		return member;
	}
}
