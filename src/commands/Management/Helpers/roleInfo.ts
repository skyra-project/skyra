import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { BrandingColors } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { MessageEmbed, Permissions, Role } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	cooldown: 10,
	description: LanguageKeys.Commands.Management.RoleInfoDescription,
	extendedHelp: LanguageKeys.Commands.Management.RoleInfoExtended,
	permissionLevel: PermissionLevels.Moderator,
	requiredPermissions: ['EMBED_LINKS'],
	runIn: ['text'],
	usage: '[role:rolename]'
})
export default class extends SkyraCommand {
	public async run(message: GuildMessage, [role = message.member.roles.highest]: [Role?]) {
		const t = await message.fetchT();
		const roleInfoTitles = t(LanguageKeys.Commands.Management.RoleInfoTitles);

		const permissions = role.permissions.has(Permissions.FLAGS.ADMINISTRATOR)
			? t(LanguageKeys.Commands.Management.RoleInfoAll)
			: role.permissions.toArray().length > 0
			? role.permissions
					.toArray()
					.map((key) => `+ **${t(`permissions:${key}`, key)}**`)
					.join('\n')
			: t(LanguageKeys.Commands.Management.RoleInfoNoPermissions);

		return message.send(
			new MessageEmbed()
				.setColor(role.color || BrandingColors.Secondary)
				.setTitle(`${role.name} [${role.id}]`)
				.setDescription(
					t(LanguageKeys.Commands.Management.RoleInfoData, {
						role,
						hoisted: t(role.hoist ? LanguageKeys.Globals.Yes : LanguageKeys.Globals.No),
						mentionable: t(role.mentionable ? LanguageKeys.Globals.Yes : LanguageKeys.Globals.No)
					})
				)
				.addField(roleInfoTitles.PERMISSIONS, permissions)
		);
	}
}
