import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { BrandingColors } from '@utils/constants';
import { cast } from '@utils/util';
import { MessageEmbed, Permissions, Role } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 10,
			description: (language) => language.get(LanguageKeys.Commands.Management.RoleInfoDescription),
			extendedHelp: (language) => language.get(LanguageKeys.Commands.Management.RoleInfoExtended),
			permissionLevel: PermissionLevels.Moderator,
			requiredPermissions: ['EMBED_LINKS'],
			runIn: ['text'],
			usage: '[role:rolename]'
		});
	}

	public run(message: KlasaMessage, [role = message.member!.roles.highest]: [Role?]) {
		const roleInfoTitles = cast<RoleInfoTitles>(message.language.get(LanguageKeys.Commands.Management.RoleInfoTitles));

		const permissions = role.permissions.has(Permissions.FLAGS.ADMINISTRATOR)
			? message.language.get(LanguageKeys.Commands.Management.RoleInfoAll)
			: role.permissions.toArray().length > 0
			? role.permissions
					.toArray()
					.map((key) => `+ **${message.language.PERMISSIONS[key]}**`)
					.join('\n')
			: message.language.get(LanguageKeys.Commands.Management.RoleInfoNoPermissions);

		return message.sendEmbed(
			new MessageEmbed()
				.setColor(role.color || BrandingColors.Secondary)
				.setTitle(`${role.name} [${role.id}]`)
				.setDescription(
					message.language
						.get(LanguageKeys.Commands.Management.RoleInfoData, {
							role,
							hoisted: message.language.get(role.hoist ? LanguageKeys.Globals.Yes : LanguageKeys.Globals.No),
							mentionable: message.language.get(role.mentionable ? LanguageKeys.Globals.Yes : LanguageKeys.Globals.No)
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
