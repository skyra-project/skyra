import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { CLIENT_ID } from '@root/config';
import { ApplyOptions } from '@skyra/decorators';
import { APIErrors } from '@utils/constants';
import { resolveOnErrorCodes } from '@utils/util';
import { Guild, User } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['blacklist'],
	cooldown: 10,
	description: (language) => language.get('commandBlocklistDescription'),
	guarded: true,
	permissionLevel: PermissionLevels.BotOwner,
	usage: '<show|set:default> [User:user|Guild:guild] [...]',
	usageDelim: ' ',
	subcommands: true
})
export default class extends SkyraCommand {
	public async show(message: KlasaMessage) {
		const connection = await DbSet.connect();
		const clientEntity = await connection.clients.findOneOrFail({ id: CLIENT_ID });

		const guilds = await Promise.all(
			clientEntity.guildBlocklist.map(async (guildId) => {
				const guild = await resolveOnErrorCodes(this.client.guilds.fetch(guildId), APIErrors.UnknownGuild);
				if (guild) return `${guild.name} (\`${guildId}\`)`;
				return `Unknown Guild (\`${guildId}\`)`;
			})
		);
		const users = await Promise.all(
			clientEntity.userBlocklist.map(async (userId) => {
				const user = await resolveOnErrorCodes(this.client.users.fetch(userId), APIErrors.UnknownUser);
				if (user) return `${user.tag} (\`${userId}\`)`;
				return `Unknown User (\`${userId}\`()`;
			})
		);

		return message.send(
			[
				//
				'**Blocked Guilds**',
				guilds.join('\n'),
				'⎯'.repeat(20),
				'**Blocked Users**',
				users.join('\n')
			].join('\n'),
			{ split: true }
		);
	}

	public async set(message: KlasaMessage, usersAndGuilds: User[] | Guild[]) {
		const connection = await DbSet.connect();
		const clientEntity = await connection.clients.ensure();

		for (const userOrGuild of new Set<User | Guild>(usersAndGuilds)) {
			if (userOrGuild instanceof User) {
				if (clientEntity.userBlocklist.includes(userOrGuild.id)) {
					clientEntity.userBlocklist.splice(clientEntity.userBlocklist.indexOf(userOrGuild.id), 1);
				} else {
					clientEntity.userBlocklist.push(userOrGuild.id);
				}
			} else if (userOrGuild instanceof Guild) {
				if (clientEntity.guildBlocklist.includes(userOrGuild.id)) {
					clientEntity.guildBlocklist.splice(clientEntity.guildBlocklist.indexOf(userOrGuild.id), 1);
				} else {
					clientEntity.guildBlocklist.push(userOrGuild.id);
				}
			}
		}

		await clientEntity.save();

		return message.sendLocale('commandBlocklistSuccess');
	}
}
