import { ModerationCommand, ModerationCommandOptions, CommandContext, HandledCommandContext } from '@lib/structures/ModerationCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';
import { Role, User } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<ModerationCommandOptions>({
	cooldown: 10,
	description: language => language.tget('COMMAND_REMOVEROLE_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_REMOVEROLE_EXTENDED'),
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

	protected handle(message: KlasaMessage, context: HandledCommandContext & { role: Role }) {
		return message.guild!.security.actions.removeRole({
			user_id: context.target.id,
			moderator_id: message.author.id,
			reason: context.reason
		}, context.role, this.getTargetDM(message, context.target));
	}

}
