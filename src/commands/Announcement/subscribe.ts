import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { announcementCheck } from '@utils/util';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	cooldown: 15,
	description: (language) => language.get(LanguageKeys.Commands.Announcement.SubscribeDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Announcement.SubscribeExtended),
	requiredGuildPermissions: ['MANAGE_ROLES'],
	runIn: ['text']
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage) {
		const role = announcementCheck(message);
		const allRoleSets = message.guild!.settings.get(GuildSettings.Roles.UniqueRoleSets);

		// Get all the role ids that the member has and remove the guild id so we dont assign the everyone role
		const memberRolesSet = new Set(message.member!.roles.cache.keys());
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

		return message.sendLocale(LanguageKeys.Commands.Announcement.SubscribeSuccess, [{ role: role.name }]);
	}
}
