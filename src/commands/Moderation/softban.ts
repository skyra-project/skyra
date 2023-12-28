import { GuildSettings, readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationCommand } from '#lib/moderation';
import { getModeration, getSecurity } from '#utils/functions';
import { TimeOptions, getSeconds } from '#utils/moderation-utilities';
import type { Unlock } from '#utils/moderationConstants';
import { getImage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import type { ArgumentTypes } from '@sapphire/utilities';
import { PermissionFlagsBits } from 'discord.js';

@ApplyOptions<ModerationCommand.Options>({
	aliases: ['sb'],
	description: LanguageKeys.Commands.Moderation.SoftBanDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.SoftBanExtended,
	options: TimeOptions,
	requiredClientPermissions: [PermissionFlagsBits.BanMembers],
	requiredMember: false
})
export class UserModerationCommand extends ModerationCommand {
	public override async prehandle(...[message]: ArgumentTypes<ModerationCommand['prehandle']>) {
		const [banAdd, banRemove] = await readSettings(message.guild, [GuildSettings.Events.BanAdd, GuildSettings.Events.BanRemove]);
		return banAdd || banRemove ? { unlock: getModeration(message.guild).createLock() } : null;
	}

	public async handle(...[message, context]: ArgumentTypes<ModerationCommand['handle']>) {
		return getSecurity(message.guild).actions.softBan(
			{
				userId: context.target.id,
				moderatorId: message.author.id,
				duration: context.duration,
				reason: context.reason,
				imageURL: getImage(message)
			},
			getSeconds(context.args),
			await this.getTargetDM(message, context.args, context.target)
		);
	}

	public override posthandle(...[, { preHandled }]: ArgumentTypes<ModerationCommand<Unlock>['posthandle']>) {
		if (preHandled) preHandled.unlock();
	}

	public override async checkModeratable(...[message, context]: ArgumentTypes<ModerationCommand['checkModeratable']>) {
		const member = await super.checkModeratable(message, context);
		if (member && !member.bannable) throw context.args.t(LanguageKeys.Commands.Moderation.BanNotBannable);
		return member;
	}
}
