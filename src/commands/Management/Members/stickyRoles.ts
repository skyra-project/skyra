import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { Role, User } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	bucket: 2,
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Management.StickyRolesDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Management.StickyRolesExtended),
	permissionLevel: PermissionLevels.Administrator,
	requiredGuildPermissions: ['MANAGE_ROLES'],
	runIn: ['text'],
	subcommands: true,
	usage: '<show|add|remove|reset> (user:username) (role:rolename)',
	usageDelim: ' '
})
@CreateResolvers([
	[
		'username',
		(arg, possible, msg) => {
			if (!arg) throw msg.language.get(LanguageKeys.Commands.Management.StickyRolesRequiredUser);
			return msg.client.arguments.get('username')!.run(arg, possible, msg);
		}
	],
	[
		'rolename',
		(arg, possible, msg, [action]) => {
			if (action === 'reset' || action === 'show') return undefined;
			if (!arg) throw msg.language.get(LanguageKeys.Commands.Management.StickyRolesRequiredRole);
			return msg.client.arguments.get('rolename')!.run(arg, possible, msg);
		}
	]
])
export default class extends SkyraCommand {
	public async reset(message: KlasaMessage, [user]: [User]) {
		const roles = message.guild!.stickyRoles.get(user.id);
		if (!roles.length) throw message.language.get(LanguageKeys.Commands.Management.StickyRolesNotExists, { user: user.username });

		await message.guild!.stickyRoles.clear(user.id, { author: message.author.id });
		return message.sendLocale(LanguageKeys.Commands.Management.StickyRolesReset, [{ user: user.username }]);
	}

	public async remove(message: KlasaMessage, [user, role]: [User, Role]) {
		const roles = await message.guild!.stickyRoles.fetch(user.id);
		if (!roles.length) throw message.language.get(LanguageKeys.Commands.Management.StickyRolesNotExists, { user: user.username });

		await message.guild!.stickyRoles.remove(user.id, role.id, { author: message.author.id });
		return message.sendLocale(LanguageKeys.Commands.Management.StickyRolesRemove, [{ user: user.username }]);
	}

	public async add(message: KlasaMessage, [user, role]: [User, Role]) {
		await message.guild!.stickyRoles.add(user.id, role.id, { author: message.author.id });
		return message.sendLocale(LanguageKeys.Commands.Management.StickyRolesAdd, [{ user: user.username }]);
	}

	public async show(message: KlasaMessage, [user]: [User]) {
		const roles = await message.guild!.stickyRoles.fetch(user.id);
		if (!roles.length) throw message.language.get(LanguageKeys.Commands.Management.StickyRolesShowEmpty);

		const guildRoles = message.guild!.roles;
		const names = roles.map((role) => guildRoles.cache.get(role)!.name);
		return message.sendLocale(LanguageKeys.Commands.Management.StickyRolesShowSingle, [
			{
				user: user.username,
				roles: message.language.list(
					names.map((name) => `\`${name}\``),
					message.language.get(LanguageKeys.Globals.And)
				)
			}
		]);
	}
}
