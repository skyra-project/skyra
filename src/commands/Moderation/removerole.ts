import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationCommand } from '#lib/moderation';
import { PermissionLevels, type GuildMessage } from '#lib/types';
import { TypeVariation } from '#utils/moderationConstants';
import { ApplyOptions } from '@sapphire/decorators';
import { PermissionFlagsBits, type Role } from 'discord.js';

type Type = TypeVariation.RoleRemove;
type ValueType = null;

@ApplyOptions<ModerationCommand.Options<Type>>({
	aliases: ['rro'],
	description: LanguageKeys.Commands.Moderation.RemoveRoleDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.RemoveRoleExtended,
	permissionLevel: PermissionLevels.Administrator,
	requiredClientPermissions: [PermissionFlagsBits.ManageRoles],
	requiredMember: true,
	type: TypeVariation.RoleRemove
})
export class UserModerationCommand extends ModerationCommand<Type, ValueType> {
	protected override async resolveParameters(args: ModerationCommand.Args) {
		return {
			targets: await this.resolveParametersUser(args),
			role: await args.pick('roleName'),
			duration: await this.resolveParametersDuration(args),
			reason: await this.resolveParametersReason(args)
		};
	}

	protected override getHandleData(message: GuildMessage, context: HandlerParameters) {
		return this.getActionData(message, context.args, context.target, context.role);
	}
}

interface HandlerParameters extends ModerationCommand.HandlerParameters<ValueType> {
	role: Role;
}
