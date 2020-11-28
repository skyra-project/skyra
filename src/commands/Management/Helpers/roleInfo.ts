import { SkyraCommand } from '#lib/structures/SkyraCommand';
import { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { BrandingColors } from '#utils/constants';
import { cast } from '#utils/util';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed, Permissions, Role } from 'discord.js';
import { CommandOptions } from 'klasa';

@ApplyOptions<CommandOptions>({
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Management.RoleInfoDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Management.RoleInfoExtended),
	permissionLevel: PermissionLevels.Moderator,
	requiredPermissions: ['EMBED_LINKS'],
	runIn: ['text'],
	usage: '[role:rolename]'
})
export default class extends SkyraCommand {
	public async run(message: GuildMessage, [role = message.member.roles.highest]: [Role?]) {
		const language = await message.fetchLanguage();
		const roleInfoTitles = cast<RoleInfoTitles>(language.get(LanguageKeys.Commands.Management.RoleInfoTitles));

		const permissions = role.permissions.has(Permissions.FLAGS.ADMINISTRATOR)
			? language.get(LanguageKeys.Commands.Management.RoleInfoAll)
			: role.permissions.toArray().length > 0
			? role.permissions
					.toArray()
					.map((key) => `+ **${language.PERMISSIONS[key]}**`)
					.join('\n')
			: language.get(LanguageKeys.Commands.Management.RoleInfoNoPermissions);

		return message.sendEmbed(
			new MessageEmbed()
				.setColor(role.color || BrandingColors.Secondary)
				.setTitle(`${role.name} [${role.id}]`)
				.setDescription(
					language
						.get(LanguageKeys.Commands.Management.RoleInfoData, {
							role,
							hoisted: language.get(role.hoist ? LanguageKeys.Globals.Yes : LanguageKeys.Globals.No),
							mentionable: language.get(role.mentionable ? LanguageKeys.Globals.Yes : LanguageKeys.Globals.No)
						})
						.join('\n')
				)
				.addField(roleInfoTitles.PERMISSIONS, permissions)
		);
	}
}

interface RoleInfoTitles {
	PERMISSIONS: string;
}
