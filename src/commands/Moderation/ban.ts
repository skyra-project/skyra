import { ModerationCommand, ModerationCommandOptions } from '@lib/structures/ModerationCommand';
import { GuildMessage } from '@lib/types';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ArgumentTypes, isNumber } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { Moderation } from '@utils/constants';
import { getImage } from '@utils/util';

@ApplyOptions<ModerationCommandOptions>({
	aliases: ['b'],
	description: (language) => language.get(LanguageKeys.Commands.Moderation.BanDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Moderation.BanExtended),
	optionalDuration: true,
	requiredMember: false,
	requiredGuildPermissions: ['BAN_MEMBERS']
})
export default class extends ModerationCommand {
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
			await this.getDays(message),
			await this.getTargetDM(message, context.target)
		);
	}

	public posthandle(...[, { preHandled }]: ArgumentTypes<ModerationCommand<Moderation.Unlock>['posthandle']>) {
		if (preHandled) preHandled.unlock();
	}

	public async checkModeratable(...[message, language, context]: ArgumentTypes<ModerationCommand<Moderation.Unlock>['checkModeratable']>) {
		const member = await super.checkModeratable(message, language, context);
		if (member && !member.bannable) throw language.get(LanguageKeys.Commands.Moderation.BanNotBannable);
		return member;
	}

	private async getDays(message: GuildMessage) {
		const regex = new RegExp(await message.fetchLocale(LanguageKeys.Commands.Moderation.ModerationDays), 'i');
		for (const [key, value] of Object.entries(message.flagArgs)) {
			if (regex.test(key)) {
				const parsed = Number(value);
				if (isNumber(parsed) && parsed >= 0 && parsed <= 7) return parsed;
			}
		}
		return 0;
	}
}
