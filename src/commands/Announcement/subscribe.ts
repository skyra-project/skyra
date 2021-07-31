import { GuildSettings, readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { announcementCheck } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@skyra/editable-commands';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Announcement.SubscribeDescription,
	extendedHelp: LanguageKeys.Commands.Announcement.SubscribeExtended,
	requiredClientPermissions: ['MANAGE_ROLES'],
	runIn: ['GUILD_ANY']
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const role = await announcementCheck(message);
		const allRoleSets = await readSettings(message.guild, GuildSettings.Roles.UniqueRoleSets);

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

		return send(message, args.t(LanguageKeys.Commands.Announcement.SubscribeSuccess, { role: role.name }));
	}
}
