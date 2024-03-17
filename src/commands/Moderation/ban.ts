import { GuildSettings, readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationActions, ModerationCommand } from '#lib/moderation';
import { getModeration } from '#utils/functions';
import { TimeOptions, getSeconds } from '#utils/moderation-utilities';
import type { Unlock } from '#utils/moderationConstants';
import { getImage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import type { ArgumentTypes } from '@sapphire/utilities';
import { PermissionFlagsBits } from 'discord.js';

@ApplyOptions<ModerationCommand.Options>({
	aliases: ['b'],
	description: LanguageKeys.Commands.Moderation.BanDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.BanExtended,
	optionalDuration: true,
	options: TimeOptions,
	requiredClientPermissions: [PermissionFlagsBits.BanMembers],
	requiredMember: false
})
export class UserModerationCommand extends ModerationCommand {
	public override async prehandle(...[message]: ArgumentTypes<ModerationCommand['prehandle']>) {
		return (await readSettings(message.guild, GuildSettings.Events.BanAdd)) ? { unlock: getModeration(message.guild).createLock() } : null;
	}

	public async handle(...[message, context]: ArgumentTypes<ModerationCommand['handle']>) {
		return ModerationActions.ban.apply(
			message.guild,
			{ user: context.target, moderator: message.author, duration: context.duration, imageURL: getImage(message), reason: context.reason },
			await this.getActionData(message, context.args, context.target, getSeconds(context.args))
		);
	}

	public override posthandle(...[, { preHandled }]: ArgumentTypes<ModerationCommand<Unlock>['posthandle']>) {
		if (preHandled) preHandled.unlock();
	}

	public override async checkModeratable(...[message, context]: ArgumentTypes<ModerationCommand<Unlock>['checkModeratable']>) {
		const member = await super.checkModeratable(message, context);
		if (member && !member.bannable) throw context.args.t(LanguageKeys.Commands.Moderation.BanNotBannable);
		return member;
	}
}
