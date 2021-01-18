import { GuildSettings } from '#lib/database';
import { PermissionLevels } from '#lib/types/Enums';
import { OWNERS } from '#root/config';
import { hasAtLeastOneKeyInMap } from '#utils/comparators';
import { Permissions } from 'discord.js';
import { KlasaClient } from 'klasa';

export default KlasaClient.defaultPermissionLevels
	.add(
		PermissionLevels.Moderator,
		async ({ member, guild }) =>
			member
				? guild!.readSettings((settings) => {
						const roles = settings[GuildSettings.Roles.Moderator];

						return roles.length === 0
							? member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)
							: hasAtLeastOneKeyInMap(member.roles.cache, roles);
				  })
				: false,
		{ fetch: true }
	)
	.add(
		PermissionLevels.Administrator,
		async ({ member, guild }) =>
			member
				? guild!.readSettings((settings) => {
						const roles = settings[GuildSettings.Roles.Admin];

						return roles.length === 0
							? member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)
							: hasAtLeastOneKeyInMap(member.roles.cache, roles);
				  })
				: false,
		{ fetch: true }
	)
	.add(PermissionLevels.PreBotOwner, (message) => OWNERS.includes(message.author.id), { break: true })
	.add(PermissionLevels.BotOwner, (message) => OWNERS.includes(message.author.id));
