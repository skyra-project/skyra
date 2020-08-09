import { ModerationCommand, ModerationCommandOptions } from '@lib/structures/ModerationCommand';
import { ApplyOptions } from '@skyra/decorators';
import { ArgumentTypes, getImage } from '@utils/util';

@ApplyOptions<ModerationCommandOptions>({
	aliases: ['vm'],
	description: (language) => language.tget('COMMAND_VMUTE_DESCRIPTION'),
	extendedHelp: (language) => language.tget('COMMAND_VMUTE_EXTENDED'),
	optionalDuration: true,
	requiredMember: true,
	requiredGuildPermissions: ['MUTE_MEMBERS']
})
export default class extends ModerationCommand {
	public async prehandle() {
		/* Do nothing */
	}

	public async handle(...[message, context]: ArgumentTypes<ModerationCommand['handle']>) {
		return message.guild!.security.actions.voiceMute(
			{
				userID: context.target.id,
				moderatorID: message.author.id,
				reason: context.reason,
				imageURL: getImage(message),
				duration: context.duration
			},
			await this.getTargetDM(message, context.target)
		);
	}

	public async posthandle() {
		/* Do nothing */
	}

	public async checkModeratable(...[message, context]: ArgumentTypes<ModerationCommand['checkModeratable']>) {
		const member = await super.checkModeratable(message, context);
		if (member && member.voice.serverMute) throw message.language.tget('COMMAND_MUTE_MUTED');
		return member;
	}
}
