import { ModerationCommand, ModerationCommandOptions } from '@lib/structures/ModerationCommand';
import { ApplyOptions } from '@skyra/decorators';
import { getImage } from '@utils/util';
import { ArgumentTypes } from '@sapphire/utilities';

@ApplyOptions<ModerationCommandOptions>({
	aliases: ['uvm', 'vum', 'unvmute'],
	description: (language) => language.get('COMMAND_VUNMUTE_DESCRIPTION'),
	extendedHelp: (language) => language.get('COMMAND_VUNMUTE_EXTENDED'),
	requiredMember: true,
	requiredPermissions: ['MUTE_MEMBERS']
})
export default class extends ModerationCommand {
	public async prehandle() {
		/* Do nothing */
	}

	public async handle(...[message, context]: ArgumentTypes<ModerationCommand['handle']>) {
		return message.guild!.security.actions.unVoiceMute(
			{
				userID: context.target.id,
				moderatorID: message.author.id,
				reason: context.reason,
				imageURL: getImage(message)
			},
			await this.getTargetDM(message, context.target)
		);
	}

	public async posthandle() {
		/* Do nothing */
	}

	public async checkModeratable(...[message, context]: ArgumentTypes<ModerationCommand['checkModeratable']>) {
		const member = await super.checkModeratable(message, context);
		if (member && !member.voice.serverMute) throw message.language.get('GUILD_MUTE_NOT_FOUND');
		return member;
	}
}
