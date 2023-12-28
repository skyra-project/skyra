import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { PermissionLevels, type GuildMessage } from '#lib/types';
import { PermissionsBits } from '#utils/bits';
import { BrandingColors } from '#utils/constants';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Management.RoleInfoDescription,
	detailedDescription: LanguageKeys.Commands.Management.RoleInfoExtended,
	permissionLevel: PermissionLevels.Moderator,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks],
	runIn: [CommandOptionsRunTypeEnum.GuildAny]
})
export class UserCommand extends SkyraCommand {
	public override async messageRun(message: GuildMessage, args: SkyraCommand.Args) {
		const role = args.finished ? message.member.roles.highest : await args.pick('roleName');
		const roleInfoTitles = args.t(LanguageKeys.Commands.Management.RoleInfoTitles);

		const permissions = role.permissions.bitfield;
		const permissionsString = PermissionsBits.has(permissions, PermissionFlagsBits.Administrator)
			? args.t(LanguageKeys.Commands.Management.RoleInfoAll)
			: permissions > 0n
				? PermissionsBits.toArray(permissions)
						.map((name) => `+ ${args.t(`permissions:${name}`)}`)
						.join('\n')
				: args.t(LanguageKeys.Commands.Management.RoleInfoNoPermissions);

		const description = args.t(LanguageKeys.Commands.Management.RoleInfoData, {
			role,
			hoisted: args.t(role.hoist ? LanguageKeys.Globals.Yes : LanguageKeys.Globals.No),
			mentionable: args.t(role.mentionable ? LanguageKeys.Globals.Yes : LanguageKeys.Globals.No)
		});

		const embed = new EmbedBuilder()
			.setColor(role.color || BrandingColors.Secondary)
			.setTitle(`${role.name} [${role.id}]`)
			.setDescription(description)
			.addFields({ name: roleInfoTitles.PERMISSIONS, value: permissionsString });
		return send(message, { embeds: [embed] });
	}
}
