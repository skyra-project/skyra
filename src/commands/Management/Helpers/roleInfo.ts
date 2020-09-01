import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { BrandingColors } from '@utils/constants';
import { MessageEmbed, Permissions, Role } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 10,
			description: (language) => language.get('commandRoleInfoDescription'),
			extendedHelp: (language) => language.get('commandRoleInfoExtended'),
			permissionLevel: PermissionLevels.Moderator,
			requiredPermissions: ['EMBED_LINKS'],
			runIn: ['text'],
			usage: '[role:rolename]'
		});
	}

	public run(message: KlasaMessage, [role = message.member!.roles.highest]: [Role?]) {
		const roleInfoTitles = (message.language.get('commandRoleInfoTitles') as unknown) as RoleInfoTitles;
		const { permissions } = role;
		return message.sendEmbed(
			new MessageEmbed()
				.setColor(role.color || BrandingColors.Secondary)
				.setTitle(`${role.name} [${role.id}]`)
				.setDescription(
					message.language.get('commandRoleInfo', {
						role,
						hoisted: message.language.get(role.hoist ? 'globalYes' : 'globalNo'),
						mentionable: message.language.get(role.mentionable ? 'globalYes' : 'globalNo')
					})
				)
				.addField(
					roleInfoTitles.PERMISSIONS,
					permissions.has(Permissions.FLAGS.ADMINISTRATOR)
						? message.language.get('commandRoleInfoAll')
						: message.language.get('commandRoleInfoPermissions', { permissions: permissions.toArray() })
				)
		);
	}
}

interface RoleInfoTitles {
	PERMISSIONS: string;
}
