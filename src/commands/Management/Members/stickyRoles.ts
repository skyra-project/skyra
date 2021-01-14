import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { Role, User } from 'discord.js';

@ApplyOptions<SkyraCommandOptions>({
	bucket: 2,
	cooldown: 10,
	description: LanguageKeys.Commands.Management.StickyRolesDescription,
	extendedHelp: LanguageKeys.Commands.Management.StickyRolesExtended,
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
		async (arg, possible, msg) => {
			if (!arg) throw await msg.resolveKey(LanguageKeys.Commands.Management.StickyRolesRequiredUser);
			return msg.client.arguments.get('username')!.run(arg, possible, msg);
		}
	],
	[
		'rolename',
		async (arg, possible, msg, [action]) => {
			if (action === 'reset' || action === 'show') return undefined;
			if (!arg) throw await msg.resolveKey(LanguageKeys.Commands.Management.StickyRolesRequiredRole);
			return msg.client.arguments.get('rolename')!.run(arg, possible, msg);
		}
	]
])
export default class extends SkyraCommand {
	public async reset(message: GuildMessage, [user]: [User]) {
		const roles = await message.guild.stickyRoles.fetch(user.id);
		if (!roles.length) throw await message.resolveKey(LanguageKeys.Commands.Management.StickyRolesNotExists, { user: user.username });

		await message.guild.stickyRoles.clear(user.id);
		return message.sendTranslated(LanguageKeys.Commands.Management.StickyRolesReset, [{ user: user.username }]);
	}

	public async remove(message: GuildMessage, [user, role]: [User, Role]) {
		const roles = await message.guild.stickyRoles.fetch(user.id);
		if (!roles.length) throw await message.resolveKey(LanguageKeys.Commands.Management.StickyRolesNotExists, { user: user.username });

		await message.guild.stickyRoles.remove(user.id, role.id);
		return message.sendTranslated(LanguageKeys.Commands.Management.StickyRolesRemove, [{ user: user.username }]);
	}

	public async add(message: GuildMessage, [user, role]: [User, Role]) {
		await message.guild.stickyRoles.add(user.id, role.id);
		return message.sendTranslated(LanguageKeys.Commands.Management.StickyRolesAdd, [{ user: user.username }]);
	}

	public async show(message: GuildMessage, [user]: [User]) {
		const t = await message.fetchT();

		const sticky = await message.guild.stickyRoles.fetch(user.id);
		if (!sticky.length) throw t(LanguageKeys.Commands.Management.StickyRolesShowEmpty);

		const roles = message.guild.roles.cache;
		const names = sticky.map((role) => roles.get(role)!.name);
		return message.send(
			t(LanguageKeys.Commands.Management.StickyRolesShowSingle, {
				user: user.username,
				roles: names.map((name) => `\`${name}\``)
			})
		);
	}
}
