import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import { PermissionLevels } from '#lib/types/Enums';
import { CLIENT_ID } from '#root/config';
import { resolveOnErrorCodes } from '#utils/util';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';
import { Guild, Message, User } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['blacklist'],
	cooldown: 10,
	description: LanguageKeys.Commands.Admin.BlocklistDescription,
	extendedHelp: LanguageKeys.Commands.Admin.BlocklistExtended,
	guarded: true,
	permissionLevel: PermissionLevels.BotOwner,
	usage: '<show|reset|remove|set:default> (user:optionalUser|guild:optionalGuild) [...]',
	usageDelim: ' ',
	subcommands: true
})
@CreateResolvers([
	[
		'optionalUser',
		(arg, possible, message, [action]) => {
			if (action === 'show' || action === 'reset') return undefined;
			return message.client.arguments.get('username')!.run(arg, possible, message);
		}
	],
	[
		'optionalGuild',
		(arg, possible, message, [action]) => {
			if (action === 'show' || action === 'reset') return undefined;
			return message.client.arguments.get('guild')!.run(arg, possible, message);
		}
	]
])
export default class extends SkyraCommand {
	public async show(message: Message) {
		const connection = await DbSet.connect();
		const clientEntity = await connection.clients.findOneOrFail({ id: CLIENT_ID });

		const guilds = await Promise.all(
			clientEntity.guildBlocklist.map(async (guildId) => {
				const guild = await resolveOnErrorCodes(this.client.guilds.fetch(guildId), RESTJSONErrorCodes.UnknownGuild);
				if (guild) return `${guild.name} (\`${guildId}\`)`;
				return `Unknown Guild (\`${guildId}\`)`;
			})
		);
		const users = await Promise.all(
			clientEntity.userBlocklist.map(async (userId) => {
				const user = await resolveOnErrorCodes(this.client.users.fetch(userId), RESTJSONErrorCodes.UnknownUser);
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

	public async reset(message: Message) {
		const connection = await DbSet.connect();
		const clientEntity = await connection.clients.ensure();

		clientEntity.guildBlocklist = [];
		clientEntity.userBlocklist = [];

		await clientEntity.save();

		return message.sendTranslated(LanguageKeys.Commands.Admin.BlocklistResetSuccess);
	}

	public async remove(message: Message, usersAndGuilds: User[] | Guild[]) {
		const connection = await DbSet.connect();
		const clientEntity = await connection.clients.ensure();

		for (const userOrGuild of new Set<User | Guild>(usersAndGuilds)) {
			if (userOrGuild instanceof User) {
				if (clientEntity.userBlocklist.includes(userOrGuild.id)) {
					clientEntity.userBlocklist.splice(clientEntity.userBlocklist.indexOf(userOrGuild.id), 1);
				}
			} else if (userOrGuild instanceof Guild) {
				if (clientEntity.guildBlocklist.includes(userOrGuild.id)) {
					clientEntity.guildBlocklist.splice(clientEntity.guildBlocklist.indexOf(userOrGuild.id), 1);
				}
			}
		}

		await clientEntity.save();

		return message.sendTranslated(LanguageKeys.Commands.Admin.BlocklistSaveSuccess);
	}

	public async set(message: Message, usersAndGuilds: User[] | Guild[]) {
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

		return message.sendTranslated(LanguageKeys.Commands.Admin.BlocklistSaveSuccess);
	}
}
