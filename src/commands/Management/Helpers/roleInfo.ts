import { MessageEmbed, Permissions, Role } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 10,
			description: language => language.get('COMMAND_ROLEINFO_DESCRIPTION'),
			extendedHelp: language => language.get('COMMAND_ROLEINFO_EXTENDED'),
			permissionLevel: 6,
			requiredPermissions: ['EMBED_LINKS'],
			runIn: ['text'],
			usage: '[role:rolename]'
		});
	}

	public run(message: KlasaMessage, [role = message.member.roles.highest]: [Role?]) {
		const roleInfoTitles = message.language.get('COMMAND_ROLEINFO_TITLES') as unknown as RoleInfoTitles;
		const { permissions } = role;
		return message.sendEmbed(new MessageEmbed()
			.setColor(role.color || 0xDFDFDF)
			.setTitle(`${role.name} [${role.id}]`)
			.setDescription(message.language.get('COMMAND_ROLEINFO', role))
			.addField(roleInfoTitles.PERMISSIONS, permissions.has(Permissions.FLAGS.ADMINISTRATOR)
				? message.language.get('COMMAND_ROLEINFO_ALL')
				: message.language.get('COMMAND_ROLEINFO_PERMISSIONS', permissions.toArray())));
	}

}

interface RoleInfoTitles {
	PERMISSIONS: string;
}
