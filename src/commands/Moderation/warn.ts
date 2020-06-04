import { ModerationCommand, ModerationCommandOptions } from '@lib/structures/ModerationCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';
import { ArgumentTypes, getImage } from '@utils/util';

@ApplyOptions<ModerationCommandOptions>({
	aliases: ['w', 'warning'],
	description: language => language.tget('COMMAND_WARN_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_WARN_EXTENDED'),
	permissionLevel: PermissionLevels.Moderator,
	requiredMember: true,
	optionalDuration: true
})
export default class extends ModerationCommand {

	public async prehandle() { /* Do nothing */ }

	public handle(...[message, context]: ArgumentTypes<ModerationCommand['handle']>) {
		return message.guild!.security.actions.warning({
			user_id: context.target.id,
			moderator_id: message.author.id,
			reason: context.reason,
			image_url: getImage(message),
			duration: context.duration
		}, this.getTargetDM(message, context.target));
	}

	public async posthandle() { /* Do nothing */ }

}
