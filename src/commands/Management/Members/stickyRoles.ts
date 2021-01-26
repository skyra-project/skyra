import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SkyraCommand.Options>({
	bucket: 2,
	cooldown: 10,
	description: LanguageKeys.Commands.Management.StickyRolesDescription,
	extendedHelp: LanguageKeys.Commands.Management.StickyRolesExtended,
	permissionLevel: PermissionLevels.Administrator,
	permissions: ['MANAGE_ROLES'],
	runIn: ['text'],
	subCommands: ['add', 'remove', 'reset', { input: 'show', default: true }]
})
export class UserCommand extends SkyraCommand {
	public async add(message: GuildMessage, args: SkyraCommand.Args) {
		const user = await args.pick('userName');
		const role = await args.pick('roleName');
		await message.guild.stickyRoles.add(user.id, role.id);
		return message.send(args.t(LanguageKeys.Commands.Management.StickyRolesAdd, { user: user.username }));
	}

	public async remove(message: GuildMessage, args: SkyraCommand.Args) {
		const user = await args.pick('userName');
		const roles = await message.guild.stickyRoles.fetch(user.id);
		if (!roles.length) throw args.t(LanguageKeys.Commands.Management.StickyRolesNotExists, { user: user.username });

		const role = await args.pick('roleName');
		await message.guild.stickyRoles.remove(user.id, role.id);
		return message.send(args.t(LanguageKeys.Commands.Management.StickyRolesRemove, { user: user.username }));
	}

	public async reset(message: GuildMessage, args: SkyraCommand.Args) {
		const user = await args.pick('userName');
		const roles = await message.guild.stickyRoles.fetch(user.id);
		if (!roles.length) throw args.t(LanguageKeys.Commands.Management.StickyRolesNotExists, { user: user.username });

		await message.guild.stickyRoles.clear(user.id);
		return message.send(args.t(LanguageKeys.Commands.Management.StickyRolesReset, { user: user.username }));
	}

	public async show(message: GuildMessage, args: SkyraCommand.Args) {
		const user = await args.pick('userName');
		const sticky = await message.guild.stickyRoles.fetch(user.id);
		if (!sticky.length) throw args.t(LanguageKeys.Commands.Management.StickyRolesShowEmpty);

		const roles = message.guild.roles.cache;
		const names = sticky.map((role) => roles.get(role)!.name);
		return message.send(
			args.t(LanguageKeys.Commands.Management.StickyRolesShowSingle, { user: user.username, roles: names.map((name) => `\`${name}\``) })
		);
	}
}
