import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationCommand } from '#lib/moderation';
import { Moderation } from '#utils/constants';
import { getImage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { ArgumentTypes } from '@sapphire/utilities';

@ApplyOptions<ModerationCommand.Options>({
	aliases: ['b'],
	description: LanguageKeys.Commands.Moderation.BanDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.BanExtended,
	optionalDuration: true,
	requiredMember: false,
	permissions: ['BAN_MEMBERS'],
	strategyOptions: { options: ['d', 'day', 'days'] }
})
export class UserModerationCommand extends ModerationCommand {
	public async prehandle(...[message]: ArgumentTypes<ModerationCommand['prehandle']>) {
		return (await message.guild.readSettings(GuildSettings.Events.BanAdd)) ? { unlock: message.guild.moderation.createLock() } : null;
	}

	public async handle(...[message, context]: ArgumentTypes<ModerationCommand['handle']>) {
		return message.guild.security.actions.ban(
			{
				userID: context.target.id,
				moderatorID: message.author.id,
				duration: context.duration,
				imageURL: getImage(message),
				reason: context.reason
			},
			await this.getDays(context.args),
			await this.getTargetDM(message, context.args, context.target)
		);
	}

	public posthandle(...[, { preHandled }]: ArgumentTypes<ModerationCommand<Moderation.Unlock>['posthandle']>) {
		if (preHandled) preHandled.unlock();
	}

	public async checkModeratable(...[message, context]: ArgumentTypes<ModerationCommand<Moderation.Unlock>['checkModeratable']>) {
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
