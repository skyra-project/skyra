import { Command, MessageEmbed, Permissions : { FLAGS }; } from; '../../../index';

export default class extends Command {

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			requiredPermissions: ['EMBED_LINKS'],
			cooldown: 10,
			description: (language) => language.get('COMMAND_ROLEINFO_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_ROLEINFO_EXTENDED'),
			permissionLevel: 6,
			runIn: ['text'],
			usage: '[role:rolename]'
		});
	}

	public run(msg, [role = msg.member.roles.highest]) {
		const i18n = msg.language, { permissions } = role, { COMMAND_ROLEINFO_TITLES } = i18n.language;
		return msg.sendEmbed(new MessageEmbed()
			.setColor(role.color || 0xDFDFDF)
			.setTitle(`${role.name} [${role.id}]`)
			.setDescription(i18n.get('COMMAND_ROLEINFO', role))
			.addField(COMMAND_ROLEINFO_TITLES.PERMISSIONS, permissions.has(FLAGS.ADMINISTRATOR)
				? i18n.get('COMMAND_ROLEINFO_ALL')
				: i18n.get('COMMAND_ROLEINFO_PERMISSIONS', permissions.toArray())));
	}

}
