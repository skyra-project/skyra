import { ModerationCommand, ModerationCommandOptions } from '@lib/structures/ModerationCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { ArgumentTypes } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { getImage } from '@utils/util';

@ApplyOptions<ModerationCommandOptions>({
	aliases: ['w', 'warning'],
	description: (language) => language.get('commandWarnDescription'),
	extendedHelp: (language) => language.get('commandWarnExtended'),
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
