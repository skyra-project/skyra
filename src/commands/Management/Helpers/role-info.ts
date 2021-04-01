import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { BrandingColors } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { MessageEmbed, Permissions } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	cooldown: 10,
	description: LanguageKeys.Commands.Management.RoleInfoDescription,
	extendedHelp: LanguageKeys.Commands.Management.RoleInfoExtended,
	permissionLevel: PermissionLevels.Moderator,
	permissions: ['EMBED_LINKS'],
	runIn: ['text']
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const role = args.finished ? message.member.roles.highest : await args.pick('roleName');
		const roleInfoTitles = args.t(LanguageKeys.Commands.Management.RoleInfoTitles);

		const permissions = role.permissions.has(Permissions.FLAGS.ADMINISTRATOR)
			? args.t(LanguageKeys.Commands.Management.RoleInfoAll)
			: role.permissions.toArray().length > 0
			? role.permissions
					.toArray()
					.map((key) => `+ **${args.t(`permissions:${key}`, key)}**`)
					.join('\n')
			: args.t(LanguageKeys.Commands.Management.RoleInfoNoPermissions);

		return message.send(
			new MessageEmbed()
				.setColor(role.color || BrandingColors.Secondary)
				.setTitle(`${role.name} [${role.id}]`)
				.setDescription(
					args.t(LanguageKeys.Commands.Management.RoleInfoData, {
						role,
						hoisted: args.t(role.hoist ? LanguageKeys.Globals.Yes : LanguageKeys.Globals.No),
						mentionable: args.t(role.mentionable ? LanguageKeys.Globals.Yes : LanguageKeys.Globals.No)
					})
				)
				.addField(roleInfoTitles.PERMISSIONS, permissions)
		);
	}
}
