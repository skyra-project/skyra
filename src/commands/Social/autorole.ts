import { GuildSettings, RolesAuto } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { deepClone } from '@sapphire/utilities';

const SORT = (x: RolesAuto, y: RolesAuto) => Number(x.points > y.points) || Number(x.points === y.points) - 1;

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['autoroles', 'levelrole', 'lvlrole'],
	cooldown: 10,
	description: LanguageKeys.Commands.Social.AutoRoleDescription,
	extendedHelp: LanguageKeys.Commands.Social.AutoRoleExtended,
	permissionLevel: PermissionLevels.Administrator,
	permissions: ['MANAGE_ROLES'],
	runIn: ['text'],
	subCommands: ['add', 'remove', 'update', { input: 'show', default: true }]
})
export class UserCommand extends SkyraCommand {
	public async add(message: GuildMessage, args: SkyraCommand.Args) {
		const role = await args.pick('roleName');
		const points = await args.pick('integer', { minimum: 1, maximum: 100_000_000 });

		await message.guild.writeSettings((settings) => {
			const roles = settings[GuildSettings.Roles.Auto];

			if (roles.length && roles.some((entry) => entry.id === role.id)) {
				throw args.t(LanguageKeys.Commands.Social.AutoRoleUpdateConfigured);
			}

			const sorted = [...roles, { id: role.id, points }].sort(SORT);

			settings[GuildSettings.Roles.Auto] = sorted;
		});

		return message.send(args.t(LanguageKeys.Commands.Social.AutoRoleAdd, { role, points }));
	}

	public async remove(message: GuildMessage, args: SkyraCommand.Args) {
		const role = await args.pick('roleName');

		const roleEntry = await message.guild.writeSettings((settings) => {
			const roles = settings[GuildSettings.Roles.Auto];
			const roleIndex = roles.findIndex((entry) => entry.id === role.id);

			if (roleIndex === -1) {
				throw args.t(LanguageKeys.Commands.Social.AutoRoleUpdateUnconfigured);
			}

			const roleEntry = roles[roleIndex];
			roles.splice(roleIndex, 1);

			return roleEntry;
		});

		return message.send(args.t(LanguageKeys.Commands.Social.AutoRoleRemove, { role, before: roleEntry.points }));
	}

	public async update(message: GuildMessage, args: SkyraCommand.Args) {
		const role = await args.pick('roleName');
		const points = await args.pick('integer', { minimum: 1, maximum: 100_000_000 });

		const autoRole = await message.guild.writeSettings((settings) => {
			const roleIndex = settings[GuildSettings.Roles.Auto].findIndex((entry) => entry.id === role.id);

			if (roleIndex === -1) {
				throw args.t(LanguageKeys.Commands.Social.AutoRoleUpdateUnconfigured);
			}

			const autoRole = settings[GuildSettings.Roles.Auto][roleIndex];
			const clone = deepClone(settings[GuildSettings.Roles.Auto]);

			settings[GuildSettings.Roles.Auto] = clone.sort(SORT);
			return autoRole;
		});

		return message.send(args.t(LanguageKeys.Commands.Social.AutoRoleUpdate, { role, points, before: autoRole.points }));
	}

	public async show(message: GuildMessage, args: SkyraCommand.Args) {
		const output = await message.guild.writeSettings((settings) => {
			const autoRoles = settings[GuildSettings.Roles.Auto];

			if (!autoRoles.length) throw args.t(LanguageKeys.Commands.Social.AutoRoleListEmpty);

			const filtered = new Set(autoRoles);
			const output: string[] = [];
			for (const obj of autoRoles) {
				const role = message.guild.roles.cache.get(obj.id);
				if (role) output.push(`${obj.points.toString().padStart(6, ' ')} : ${role.name}`);
				else filtered.delete(obj);
			}

			if (filtered.size !== autoRoles.length) {
				settings[GuildSettings.Roles.Auto] = [...filtered];
			}

			if (!output.length) throw args.t(LanguageKeys.Commands.Social.AutoRoleListEmpty);

			return output;
		});

		return message.send(output.join('\n'), { code: 'http' });
	}
}
