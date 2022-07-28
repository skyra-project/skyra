import { GuildSettings, readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationCommand } from '#lib/moderation';
import { getModeration, getSecurity } from '#utils/functions';
import type { Unlock } from '#utils/moderationConstants';
import { getImage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import type { ArgumentTypes } from '@sapphire/utilities';
import { PermissionFlagsBits } from 'discord-api-types/v9';

@ApplyOptions<ModerationCommand.Options>({
	aliases: ['b'],
	description: LanguageKeys.Commands.Moderation.BanDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.BanExtended,
	optionalDuration: true,
	options: ['d', 'day', 'days'],
	requiredClientPermissions: [PermissionFlagsBits.BanMembers],
	requiredMember: false
})
export class UserModerationCommand extends ModerationCommand {
	public async prehandle(...[message]: ArgumentTypes<ModerationCommand['prehandle']>) {
		return (await readSettings(message.guild, GuildSettings.Events.BanAdd)) ? { unlock: getModeration(message.guild).createLock() } : null;
	}

	public async handle(...[message, context]: ArgumentTypes<ModerationCommand['handle']>) {
		return getSecurity(message.guild).actions.ban(
			{
				userId: context.target.id,
				moderatorId: message.author.id,
				duration: context.duration,
				imageURL: getImage(message),
				reason: context.reason
			},
			await this.getDays(context.args),
			await this.getTargetDM(message, context.args, context.target)
		);
	}

	public posthandle(...[, { preHandled }]: ArgumentTypes<ModerationCommand<Unlock>['posthandle']>) {
		if (preHandled) preHandled.unlock();
	}

	public async checkModeratable(...[message, context]: ArgumentTypes<ModerationCommand<Unlock>['checkModeratable']>) {
		const member = await super.checkModeratable(message, context);
		if (member && !member.bannable) throw context.args.t(LanguageKeys.Commands.Moderation.BanNotBannable);
		return member;
	}

	private async getDays(args: ModerationCommand.Args) {
		const value = args.getOption('d', 'day', 'days');
		if (value === null) return 0;

		const parsed = Number(value);
		if (Number.isInteger(parsed) && parsed >= 0 && parsed <= 7) return parsed;
		return 0;
	}
}
