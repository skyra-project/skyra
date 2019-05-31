import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { announcementCheck } from '../../lib/util/util';
import { GuildSettings } from '../../lib/types/settings/GuildSettings';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 15,
			description: language => language.get('COMMAND_SUBSCRIBE_DESCRIPTION'),
			extendedHelp: language => language.get('COMMAND_SUBSCRIBE_EXTENDED'),
			requiredPermissions: ['MANAGE_ROLES'],
			runIn: ['text']
		});
	}

	public async run(message: KlasaMessage) {
		const role = announcementCheck(message);
		const allRoleSets = message.guild.settings.get(GuildSettings.Roles.UniqueRoleSets) as GuildSettings.Roles.UniqueRoleSets;

		const memberRoles = message.member.roles.map(r => r.id);

		for (const set of allRoleSets) {
			if (!set.roles.includes(role.id)) continue;
			memberRoles.filter(id => !set.roles.includes(id));
		}

		memberRoles.push(role.id);

		await message.member.roles.set(memberRoles);
		return message.sendLocale('COMMAND_SUBSCRIBE_SUCCESS', [role.name]);
	}

}
