import { CommandContext, HandledCommandContext, ModerationCommand, ModerationCommandOptions } from '#lib/structures/ModerationCommand';
import { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { getImage } from '#utils/util';
import { ApplyOptions } from '@skyra/decorators';
import { Role, User } from 'discord.js';

@ApplyOptions<ModerationCommandOptions>({
	aliases: ['rro'],
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Moderation.RemoveroleDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Moderation.RemoveroleExtended),
	requiredMember: true,
	optionalDuration: true,
	requiredGuildPermissions: ['MANAGE_ROLES'],
	permissionLevel: PermissionLevels.Administrator,
	usage: '<users:...user{,10}> <role:rolename> [duration:timespan] [reason:...string]',
	usageDelim: ' '
})
export default class extends ModerationCommand {
	protected resolveOverloads([targets, ...args]: readonly unknown[]): CommandContext & { role: Role } {
		return {
			targets: targets as User[],
			duration: args[1] as number | null,
			reason: args[2] as string | null,
			role: args[0] as Role
		};
	}

	protected async handle(message: GuildMessage, context: HandledCommandContext & { role: Role }) {
		return message.guild.security.actions.removeRole(
			{
				userID: context.target.id,
				moderatorID: message.author.id,
				reason: context.reason,
				imageURL: getImage(message),
				duration: context.duration
			},
			context.role,
			await this.getTargetDM(message, context.target)
		);
	}
}
