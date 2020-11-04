import { ModerationCommand, ModerationCommandOptions } from '@lib/structures/ModerationCommand';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ArgumentTypes } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { Moderation } from '@utils/constants';
import { getImage } from '@utils/util';

@ApplyOptions<ModerationCommandOptions>({
	aliases: ['k'],
	description: (language) => language.get(LanguageKeys.Commands.Moderation.KickDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Moderation.KickExtended),
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

	public async checkModeratable(...[message, context]: ArgumentTypes<ModerationCommand['handle']>) {
		const member = await super.checkModeratable(message, context);
		if (member && !member.kickable) throw await message.fetchLocale(LanguageKeys.Commands.Moderation.KickNotKickable);
		return member;
	}
}
