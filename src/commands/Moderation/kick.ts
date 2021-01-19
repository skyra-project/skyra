import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationCommand } from '#lib/structures';
import { Moderation } from '#utils/constants';
import { getImage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import type { ArgumentTypes } from '@sapphire/utilities';

@ApplyOptions<ModerationCommand.Options>({
	aliases: ['k'],
	description: LanguageKeys.Commands.Moderation.KickDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.KickExtended,
	requiredGuildPermissions: ['KICK_MEMBERS'],
	requiredMember: true
})
export default class extends ModerationCommand {
	public async prehandle(...[message]: ArgumentTypes<ModerationCommand['prehandle']>) {
		return (await message.guild.readSettings(GuildSettings.Events.MemberRemove)) ? { unlock: message.guild.moderation.createLock() } : null;
	}

	public async handle(...[message, context]: ArgumentTypes<ModerationCommand['handle']>) {
		return message.guild.security.actions.kick(
			{
				userID: context.target.id,
				moderatorID: message.author.id,
				reason: context.reason,
				imageURL: getImage(message)
			},
			await this.getTargetDM(message, context.target)
		);
	}

	public posthandle(...[, { preHandled }]: ArgumentTypes<ModerationCommand<Moderation.Unlock>['posthandle']>) {
		if (preHandled) preHandled.unlock();
	}

	public async checkModeratable(...[message, t, context]: ArgumentTypes<ModerationCommand['checkModeratable']>) {
		const member = await super.checkModeratable(message, t, context);
		if (member && !member.kickable) throw t(LanguageKeys.Commands.Moderation.KickNotKickable);
		return member;
	}
}
