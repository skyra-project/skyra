import { GuildSettings } from '#lib/database/index';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { GuildMessage } from '#lib/types/index';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { announcementCheck } from '#utils/util';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<SkyraCommandOptions>({
	cooldown: 15,
	description: (language) => language.get(LanguageKeys.Commands.Announcement.SubscribeDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Announcement.SubscribeExtended),
	requiredGuildPermissions: ['MANAGE_ROLES'],
	runIn: ['text']
})
export default class extends SkyraCommand {
	public async run(message: GuildMessage) {
		const role = await announcementCheck(message);
		const allRoleSets = await message.guild.readSettings(GuildSettings.Roles.UniqueRoleSets);

		// Get all the role ids that the member has and remove the guild id so we don't assign the everyone role
		const memberRolesSet = new Set(message.member.roles.cache.keys());
		// Remove the everyone role from the set
		memberRolesSet.delete(message.guild.id);

		// For each set that has the subscriber role remove all the roles from the set
		for (const set of allRoleSets) {
			if (!set.roles.includes(role.id)) continue;
			for (const id of set.roles) memberRolesSet.delete(id);
		}

		// Add the subscriber role to the set
		memberRolesSet.add(role.id);

		await message.member.roles.set([...memberRolesSet]);

		return message.sendLocale(LanguageKeys.Commands.Announcement.SubscribeSuccess, [{ role: role.name }]);
	}
}
