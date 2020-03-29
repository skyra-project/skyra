import { ModerationCommand, ModerationCommandOptions } from '@lib/structures/ModerationCommand';
import { ApplyOptions } from '@skyra/decorators';
import { ArgumentTypes } from '@utils/util';

@ApplyOptions<ModerationCommandOptions>({
	aliases: ['vk'],
	description: language => language.tget('COMMAND_VOICEKICK_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_VOICEKICK_EXTENDED'),
	requiredMember: true,
	requiredPermissions: ['MANAGE_CHANNELS', 'MOVE_MEMBERS']
})
export default class extends ModerationCommand {

	public async prehandle() { /* Do nothing */ }

	public handle(...[message, context]: ArgumentTypes<ModerationCommand['handle']>) {
		return message.guild!.security.actions.voiceKick({
			user_id: context.target.id,
			moderator_id: message.author.id,
			reason: context.reason
		}, this.getTargetDM(message, context.target));
	}

	public async posthandle() { /* Do nothing */ }

	public async checkModeratable(...[message, context]: ArgumentTypes<ModerationCommand['checkModeratable']>) {
		const member = await super.checkModeratable(message, context);
		if (member && !member.voice.channelID) throw message.language.tget('GUILD_MEMBER_NOT_VOICECHANNEL');
		return member;
	}

}
