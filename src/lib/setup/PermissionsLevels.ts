import { GuildSettings } from '#lib/database/index';
import { PermissionLevels } from '#lib/types/Enums';
import { Permissions } from 'discord.js';
import { KlasaClient } from 'klasa';

export default KlasaClient.defaultPermissionLevels
	.add(
		PermissionLevels.Moderator,
		async (message) =>
			message.member
				? message.guild!.readSettings((settings) => {
						const id = settings[GuildSettings.Roles.Moderator];
						return id ? message.member!.roles.cache.has(id) : message.member!.permissions.has(Permissions.FLAGS.BAN_MEMBERS);
				  })
				: false,
		{ fetch: true }
	)
	.add(
		PermissionLevels.Administrator,
		async (message) =>
			message.member
				? message.guild!.readSettings((settings) => {
						const id = settings[GuildSettings.Roles.Admin];
						return id ? message.member!.roles.cache.has(id) : message.member!.permissions.has(Permissions.FLAGS.MANAGE_GUILD);
				  })
				: false,
		{ fetch: true }
	);
