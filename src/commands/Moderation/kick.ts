import { ModerationCommand, ModerationCommandOptions } from '@lib/structures/ModerationCommand';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { ApplyOptions } from '@skyra/decorators';
import { Moderation } from '@utils/constants';
import { ArgumentTypes } from '@utils/util';

@ApplyOptions<ModerationCommandOptions>({
	aliases: ['k'],
	description: language => language.tget('COMMAND_KICK_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_KICK_EXTENDED'),
	requiredGuildPermissions: ['KICK_MEMBERS'],
	requiredMember: true
})
export default class extends ModerationCommand {

	public prehandle(...[message]: ArgumentTypes<ModerationCommand['prehandle']>) {
		return message.guild!.settings.get(GuildSettings.Events.MemberRemove) ? { unlock: message.guild!.moderation.createLock() } : null;
	}

	public handle(...[message, context]: ArgumentTypes<ModerationCommand['handle']>) {
		return message.guild!.security.actions.kick({
			user_id: context.target.id,
			moderator_id: message.author.id,
			reason: context.reason
		}, this.getTargetDM(message, context.target));
	}

	public posthandle(...[, { preHandled }]: ArgumentTypes<ModerationCommand<Moderation.Unlock>['posthandle']>) {
		if (preHandled) preHandled.unlock();
	}

	public async checkModeratable(...[message, context]: ArgumentTypes<ModerationCommand['handle']>) {
		const member = await super.checkModeratable(message, context);
		if (member && !member.kickable) throw message.language.tget('COMMAND_KICK_NOT_KICKABLE');
		return member;
	}

}
