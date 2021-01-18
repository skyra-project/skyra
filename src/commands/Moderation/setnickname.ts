import { LanguageKeys } from '#lib/i18n/languageKeys';
import { CommandContext, HandledCommandContext, ModerationCommand } from '#lib/structures/commands/ModerationCommand';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { getImage } from '#utils/util';
import { ApplyOptions } from '@skyra/decorators';
import type { User } from 'discord.js';

@ApplyOptions<ModerationCommand.Options>({
	aliases: ['sn'],
	cooldown: 10,
	description: LanguageKeys.Commands.Moderation.SetNicknameDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.SetNicknameExtended,
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

	protected async handle(message: GuildMessage, context: HandledCommandContext & { nickname: string }) {
		return message.guild.security.actions.setNickname(
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
