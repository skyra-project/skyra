import { ModerationCommand, ModerationCommandOptions } from '@lib/structures/ModerationCommand';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { ArgumentTypes } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { Moderation } from '@utils/constants';
import { getImage } from '@utils/util';

@ApplyOptions<ModerationCommandOptions>({
	aliases: ['k'],
	description: (language) => language.get('commandKickDescription'),
	extendedHelp: (language) => language.get('commandKickExtended'),
	requiredGuildPermissions: ['KICK_MEMBERS'],
	requiredMember: true
})
export default class extends ModerationCommand {
	public prehandle(...[message]: ArgumentTypes<ModerationCommand['prehandle']>) {
		return message.guild!.settings.get(GuildSettings.Events.MemberRemove) ? { unlock: message.guild!.moderation.createLock() } : null;
	}

	public async handle(...[message, context]: ArgumentTypes<ModerationCommand['handle']>) {
		return message.guild!.security.actions.kick(
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
		if (member && !member.kickable) throw message.language.get('commandKickNotKickable');
		return member;
	}
}
