import { GuildSettings, readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationCommand } from '#lib/moderation';
import { getModeration, getSecurity } from '#utils/functions';
import type { Unlock } from '#utils/moderationConstants';
import { getImage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import type { ArgumentTypes } from '@sapphire/utilities';
import { PermissionFlagsBits } from 'discord.js';

@ApplyOptions<ModerationCommand.Options>({
	aliases: ['k'],
	description: LanguageKeys.Commands.Moderation.KickDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.KickExtended,
	requiredClientPermissions: [PermissionFlagsBits.KickMembers],
	requiredMember: true
})
export class UserModerationCommand extends ModerationCommand {
	public override async prehandle(...[message]: ArgumentTypes<ModerationCommand['prehandle']>) {
		return (await readSettings(message.guild, GuildSettings.Channels.Logs.MemberRemove))
			? { unlock: getModeration(message.guild).createLock() }
			: null;
	}

	public async handle(...[message, context]: ArgumentTypes<ModerationCommand['handle']>) {
		return getSecurity(message.guild).actions.kick(
			{
				userId: context.target.id,
				moderatorId: message.author.id,
				reason: context.reason,
				imageURL: getImage(message)
			},
			await this.getTargetDM(message, context.args, context.target)
		);
	}

	public override posthandle(...[, { preHandled }]: ArgumentTypes<ModerationCommand<Unlock>['posthandle']>) {
		if (preHandled) preHandled.unlock();
	}

	public override async checkModeratable(...[message, context]: ArgumentTypes<ModerationCommand['checkModeratable']>) {
		const member = await super.checkModeratable(message, context);
		if (member && !member.kickable) throw context.args.t(LanguageKeys.Commands.Moderation.KickNotKickable);
		return member;
	}
}
