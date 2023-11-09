import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraSubcommand } from '#lib/structures';
import { PermissionLevels, type GuildMessage } from '#lib/types';
import { getStickyRoles } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits } from 'discord-api-types/v10';

@ApplyOptions<SkyraSubcommand.Options>({
	description: LanguageKeys.Commands.Management.StickyRolesDescription,
	detailedDescription: LanguageKeys.Commands.Management.StickyRolesExtended,
	permissionLevel: PermissionLevels.Administrator,
	requiredClientPermissions: [PermissionFlagsBits.ManageRoles],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	subcommands: [{ name: 'add' }, { name: 'remove' }, { name: 'reset' }, { name: 'show', default: true }]
})
export class UserCommand extends SkyraSubcommand {
	public async add(message: GuildMessage, args: SkyraSubcommand.Args) {
		const user = await args.pick('userName');
		const role = await args.pick('roleName');

		const stickyRoles = getStickyRoles(message.guild);
		await stickyRoles.add(user.id, role.id);

		const content = args.t(LanguageKeys.Commands.Management.StickyRolesAdd, { user: user.username });
		return send(message, content);
	}

	public async remove(message: GuildMessage, args: SkyraSubcommand.Args) {
		const user = await args.pick('userName');

		const stickyRoles = getStickyRoles(message.guild);
		const roles = await stickyRoles.fetch(user.id);
		if (!roles.length) this.error(LanguageKeys.Commands.Management.StickyRolesNotExists, { user: user.username });

		const role = await args.pick('roleName');
		await stickyRoles.remove(user.id, role.id);

		const content = args.t(LanguageKeys.Commands.Management.StickyRolesRemove, { user: user.username });
		return send(message, content);
	}

	public async reset(message: GuildMessage, args: SkyraSubcommand.Args) {
		const user = await args.pick('userName');

		const stickyRoles = getStickyRoles(message.guild);
		const roles = await stickyRoles.fetch(user.id);
		if (!roles.length) this.error(LanguageKeys.Commands.Management.StickyRolesNotExists, { user: user.username });

		await stickyRoles.clear(user.id);

		const content = args.t(LanguageKeys.Commands.Management.StickyRolesReset, { user: user.username });
		return send(message, content);
	}

	public async show(message: GuildMessage, args: SkyraSubcommand.Args) {
		const user = await args.pick('userName');

		const stickyRoles = getStickyRoles(message.guild);
		const sticky = await stickyRoles.fetch(user.id);
		if (!sticky.length) this.error(LanguageKeys.Commands.Management.StickyRolesShowEmpty);

		const roles = message.guild.roles.cache;
		const names = sticky.map((role) => roles.get(role)!.name);

		const content = args.t(LanguageKeys.Commands.Management.StickyRolesShowSingle, {
			user: user.username,
			roles: names.map((name) => `\`${name}\``)
		});
		return send(message, content);
	}
}
