import { GuildSettings } from '#lib/database';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { GuildMessage } from '#lib/types';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { announcementCheck } from '#utils/util';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<SkyraCommandOptions>({
	cooldown: 15,
	description: LanguageKeys.Commands.Announcement.SubscribeDescription,
	extendedHelp: LanguageKeys.Commands.Announcement.SubscribeExtended,
	requiredGuildPermissions: ['MANAGE_ROLES'],
	runIn: ['text']
})
export default class extends SkyraCommand {
	public async run(message: GuildMessage) {
		const role = await announcementCheck(message);
		const [allRoleSets, t] = await message.guild.readSettings((settings) => [
			settings[GuildSettings.Roles.UniqueRoleSets],
			settings.getLanguage()
		]);

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

		return message.send(t(LanguageKeys.Commands.Announcement.SubscribeSuccess, [{ role: role.name }]));
	}
}
