import { ModerationCommand, ModerationCommandOptions } from '@lib/structures/ModerationCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';
import { ArgumentTypes, getImage } from '@utils/util';

@ApplyOptions<ModerationCommandOptions>({
	aliases: ['w', 'warning'],
	description: (language) => language.get('COMMAND_WARN_DESCRIPTION'),
	extendedHelp: (language) => language.get('COMMAND_WARN_EXTENDED'),
	permissionLevel: PermissionLevels.Moderator,
	requiredMember: true,
	optionalDuration: true
})
export default class extends ModerationCommand {
	public async prehandle() {
		/* Do nothing */
	}

	public async handle(...[message, context]: ArgumentTypes<ModerationCommand['handle']>) {
		return message.guild!.security.actions.warning(
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
}
