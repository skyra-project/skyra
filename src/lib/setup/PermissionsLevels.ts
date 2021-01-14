import { GuildSettings } from '#lib/database';
import { PermissionLevels } from '#lib/types/Enums';
import { hasAtLeastOneKeyInMap } from '#utils/comparators';
import { Permissions } from 'discord.js';
import { KlasaClient } from 'klasa';

export default KlasaClient.defaultPermissionLevels
	.add(
		PermissionLevels.Moderator,
		async (message) =>
			message.member
				? message.guild!.readSettings((settings) => {
						const roles = settings[GuildSettings.Roles.Moderator];

						return roles.length === 0
							? message.member!.permissions.has(Permissions.FLAGS.BAN_MEMBERS)
							: hasAtLeastOneKeyInMap(message.member!.roles.cache, roles);
				  })
				: false,
		{ fetch: true }
	)
	.add(
		PermissionLevels.Administrator,
		async (message) =>
			message.member
				? message.guild!.readSettings((settings) => {
						const roles = settings[GuildSettings.Roles.Admin];

						return roles.length === 0
							? message.member!.permissions.has(Permissions.FLAGS.MANAGE_GUILD)
							: hasAtLeastOneKeyInMap(message.member!.roles.cache, roles);
				  })
				: false,
		{ fetch: true }
	);
