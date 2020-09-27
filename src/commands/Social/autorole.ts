import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { GuildSettings, RolesAuto } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { deepClone } from '@sapphire/utilities';
import { Role } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

const SORT = (x: RolesAuto, y: RolesAuto) => Number(x.points > y.points) || Number(x.points === y.points) - 1;

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['autoroles', 'levelrole', 'lvlrole'],
			cooldown: 10,
			description: (language) => language.get(LanguageKeys.Commands.Social.AutoRoleDescription),
			extendedHelp: (language) => language.get(LanguageKeys.Commands.Social.AutoRoleExtended),
			permissionLevel: PermissionLevels.Administrator,
			requiredGuildPermissions: ['MANAGE_ROLES'],
			runIn: ['text'],
			subcommands: true,
			usage: '<add|remove|update|show:default> (role:rolename) (points:points{0,1000000})',
			usageDelim: ' '
		});

		this.createCustomResolver('rolename', (arg, possible, msg, [type]) => {
			if (type === 'show') return undefined;
			return this.client.arguments.get('rolename')!.run(arg, possible, msg);
		})
			.createCustomResolver('points', (arg, possible, msg, [type]) => {
				if (type === 'show' || type === 'remove') return undefined;
				return this.client.arguments.get('integer')!.run(arg, possible, msg);
			})
			.customizeResponse('role', (message) => message.language.get(LanguageKeys.Misc.CommandRequireRole))
			.customizeResponse('points', (message) => message.language.get(LanguageKeys.Commands.Social.AutoRolePointsRequired));
	}

	public async show(message: KlasaMessage) {
		const autoRoles = message.guild!.settings.get(GuildSettings.Roles.Auto);
		if (!autoRoles.length) throw message.language.get(LanguageKeys.Commands.Social.AutoRoleListEmpty);

		const filtered = new Set(autoRoles);
		const output: string[] = [];
		for (const obj of autoRoles) {
			const role = message.guild!.roles.cache.get(obj.id);
			if (role) output.push(`${obj.points.toString().padStart(6, ' ')} : ${role.name}`);
			else filtered.delete(obj);
		}

		if (filtered.size !== autoRoles.length)
			await message.guild!.settings.update(GuildSettings.Roles.Auto, [...filtered], { arrayAction: 'overwrite' });
		if (!output.length) throw message.language.get(LanguageKeys.Commands.Social.AutoRoleListEmpty);
		return message.sendMessage(output.join('\n'), { code: 'http' });
	}

	public async add(message: KlasaMessage, [role, points]: [Role, number]) {
		const autoRoles = message.guild!.settings.get(GuildSettings.Roles.Auto);
		if (autoRoles.length && autoRoles.some((entry) => entry.id === role.id)) {
			throw message.language.get(LanguageKeys.Commands.Social.AutoRoleUpdateConfigured);
		}

		const sorted = [...autoRoles, { id: role.id, points }].sort(SORT);
		await message.guild!.settings.update(GuildSettings.Roles.Auto, sorted, {
			arrayAction: 'overwrite',
			extraContext: { author: message.author.id }
		});
		return message.sendLocale(LanguageKeys.Commands.Social.AutoRoleAdd, [{ role, points }]);
	}

	public async remove(message: KlasaMessage, [role]: [Role]) {
		const autoRoles = message.guild!.settings.get(GuildSettings.Roles.Auto);
		const index = autoRoles.findIndex((entry) => entry.id === role.id);
		if (index === -1) {
			throw message.language.get(LanguageKeys.Commands.Social.AutoRoleUpdateConfigured);
		}

		const deleteEntry = autoRoles[index];
		await message.guild!.settings.update(GuildSettings.Roles.Auto, deleteEntry, {
			arrayAction: 'remove',
			extraContext: { author: message.author.id }
		});

		return message.sendLocale(LanguageKeys.Commands.Social.AutoRoleRemove, [{ role, before: deleteEntry.points }]);
	}

	public async update(message: KlasaMessage, [role, points]: [Role, number]) {
		const autoRoles = message.guild!.settings.get(GuildSettings.Roles.Auto);
		const index = autoRoles.findIndex((entry) => entry.id === role.id);
		if (index === -1) {
			throw message.language.get(LanguageKeys.Commands.Social.AutoRoleUpdateUnconfigured);
		}

		const autoRole = autoRoles[index];
		const clone = deepClone(autoRoles) as RolesAuto[];
		clone[index].points = points;
		await message.guild!.settings.update(GuildSettings.Roles.Auto, clone.sort(SORT), {
			arrayAction: 'overwrite',
			extraContext: { author: message.author.id }
		});
		return message.sendLocale(LanguageKeys.Commands.Social.AutoRoleUpdate, [{ role, points, before: autoRole.points }]);
	}
}
