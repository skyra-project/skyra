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
			requiredGuildPermissions: ['MANAGE_ROLES'],
			runIn: ['text']
		});
	}

	public async run(message: KlasaMessage) {
		const role = announcementCheck(message);
		const allRoleSets = message.guild!.settings.get(GuildSettings.Roles.UniqueRoleSets) as GuildSettings.Roles.UniqueRoleSets;

		// Get all the role ids that the member has and remove the guild id so we dont assign the everyone role
		const memberRolesSet = new Set(message.member!.roles.keys());
		// Remove the everyone role from the set
		memberRolesSet.delete(message.guild!.id);

		// For each set that has the subscriber role remove all the roles from the set
		for (const set of allRoleSets) {
			if (!set.roles.includes(role.id)) continue;
			for (const id of set.roles) memberRolesSet.delete(id);
		}

		// Add the subscriber role to the set
		memberRolesSet.add(role.id);

		await message.member!.roles.set([...memberRolesSet]);

		return message.sendLocale('COMMAND_SUBSCRIBE_SUCCESS', [role.name]);
	}

}
