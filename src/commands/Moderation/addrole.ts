import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationActions, ModerationCommand, type HandledCommandContext } from '#lib/moderation';
import { PermissionLevels, type GuildMessage } from '#lib/types';
import { years } from '#utils/common';
import { getImage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { PermissionFlagsBits, type Role } from 'discord.js';

@ApplyOptions<ModerationCommand.Options>({
	aliases: ['ar'],
	description: LanguageKeys.Commands.Moderation.AddRoleDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.AddRoleExtended,
	optionalDuration: true,
	permissionLevel: PermissionLevels.Administrator,
	requiredClientPermissions: [PermissionFlagsBits.ManageRoles],
	requiredMember: true
})
export class UserModerationCommand extends ModerationCommand {
	protected override async resolveOverloads(args: ModerationCommand.Args) {
		return {
			targets: await args.repeat('user', { times: 10 }),
			role: await args.pick('roleName'),
			duration: this.optionalDuration ? await args.pick('timespan', { minimum: 0, maximum: years(5) }).catch(() => null) : null,
			reason: args.finished ? null : await args.rest('string')
		};
	}

	protected async handle(message: GuildMessage, context: HandledCommandContext & { role: Role }) {
		return ModerationActions.roleAdd.apply(
			message.guild,
			{
				userId: context.target.id,
				moderatorId: message.author.id,
				reason: context.reason,
				imageURL: getImage(message),
				duration: context.duration
			},
			await this.getActionData(message, context.args, context.target, context.role)
		);
	}
}
