import { CommandContext, HandledCommandContext, ModerationCommand, ModerationCommandOptions } from '@lib/structures/ModerationCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';
import { getImage } from '@utils/util';
import { User } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<ModerationCommandOptions>({
	aliases: ['sn'],
	cooldown: 10,
	description: (language) => language.get('commandSetNicknameDescription'),
	extendedHelp: (language) => language.get('commandSetNicknameExtended'),
	requiredMember: true,
	optionalDuration: true,
	requiredGuildPermissions: ['MANAGE_NICKNAMES'],
	permissionLevel: PermissionLevels.Moderator,
	usage: '<users:...user{,10}> [nickname:nickname] [duration:timespan] [reason:...string]',
	usageDelim: ' '
})
export default class extends ModerationCommand {
	public async init() {
		this.createCustomResolver('nickname', (arg, possible, message) =>
			arg ? this.client.arguments.get('string')!.run(arg, possible, message) : ''
		);
	}

	protected resolveOverloads([targets, ...args]: readonly unknown[]): CommandContext & { nickname: string } {
		return {
			targets: targets as User[],
			duration: args[1] as number | null,
			reason: args[2] as string | null,
			nickname: args[0] as string
		};
	}

	protected async handle(message: KlasaMessage, context: HandledCommandContext & { nickname: string }) {
		return message.guild!.security.actions.setNickname(
			{
				userID: context.target.id,
				moderatorID: message.author.id,
				reason: context.reason,
				imageURL: getImage(message),
				duration: context.duration
			},
			context.nickname,
			await this.getTargetDM(message, context.target)
		);
	}
}
