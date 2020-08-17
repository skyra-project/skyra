import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { Role, User } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	bucket: 2,
	cooldown: 10,
	description: (language) => language.get('COMMAND_STICKYROLES_DESCRIPTION'),
	extendedHelp: (language) => language.get('COMMAND_STICKYROLES_EXTENDED'),
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
			if (!arg) throw msg.language.get('COMMAND_STICKYROLES_REQUIRED_USER');
			return msg.client.arguments.get('username')!.run(arg, possible, msg);
		}
	],
	[
		'rolename',
		(arg, possible, msg, [action]) => {
			if (action === 'reset' || action === 'show') return undefined;
			if (!arg) throw msg.language.get('COMMAND_STICKYROLES_REQUIRED_ROLE');
			return msg.client.arguments.get('rolename')!.run(arg, possible, msg);
		}
	]
])
export default class extends SkyraCommand {
	public async reset(message: KlasaMessage, [user]: [User]) {
		const roles = message.guild!.stickyRoles.get(user.id);
		if (!roles.length) throw message.language.get('COMMAND_STICKYROLES_NOTEXISTS', user.username);

		await message.guild!.stickyRoles.clear(user.id, { author: message.author.id });
		return message.sendLocale('COMMAND_STICKYROLES_RESET', [user.username]);
	}

	public async remove(message: KlasaMessage, [user, role]: [User, Role]) {
		const roles = await message.guild!.stickyRoles.fetch(user.id);
		if (!roles.length) throw message.language.get('COMMAND_STICKYROLES_NOTEXISTS', user.username);

		await message.guild!.stickyRoles.remove(user.id, role.id, { author: message.author.id });
		return message.sendLocale('COMMAND_STICKYROLES_REMOVE', [user.username]);
	}

	public async add(message: KlasaMessage, [user, role]: [User, Role]) {
		await message.guild!.stickyRoles.add(user.id, role.id, { author: message.author.id });
		return message.sendLocale('COMMAND_STICKYROLES_ADD', [user.username]);
	}

	public async show(message: KlasaMessage, [user]: [User]) {
		const roles = await message.guild!.stickyRoles.fetch(user.id);
		if (!roles.length) throw message.language.get('COMMAND_STICKYROLES_SHOW_EMPTY');

		const guildRoles = message.guild!.roles;
		const names = roles.map((role) => guildRoles.get(role)!.name);
		return message.sendLocale('COMMAND_STICKYROLES_SHOW_SINGLE', [user.username, names]);
	}
}
