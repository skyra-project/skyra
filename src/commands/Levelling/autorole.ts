import { GuildSettings, RolesAuto } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Identifiers } from '@sapphire/framework';
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
		const points = await this.parseLevel(args);

		await message.guild.writeSettings((settings) => {
			const roles = settings[GuildSettings.Roles.Auto];

			if (roles.length && roles.some((entry) => entry.id === role.id)) {
				this.error(LanguageKeys.Commands.Social.AutoRoleUpdateConfigured);
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
				this.error(LanguageKeys.Commands.Social.AutoRoleUpdateUnconfigured);
			}

			const roleEntry = roles[roleIndex];
			roles.splice(roleIndex, 1);

			return roleEntry;
		});

		return message.send(args.t(LanguageKeys.Commands.Social.AutoRoleRemove, { role, before: roleEntry.points }));
	}

	public async update(message: GuildMessage, args: SkyraCommand.Args) {
		const role = await args.pick('roleName');
		const points = await this.parseLevel(args);

		const autoRole = await message.guild.writeSettings((settings) => {
			const roleIndex = settings[GuildSettings.Roles.Auto].findIndex((entry) => entry.id === role.id);

			if (roleIndex === -1) {
				this.error(LanguageKeys.Commands.Social.AutoRoleUpdateUnconfigured);
			}

			const autoRole = settings[GuildSettings.Roles.Auto][roleIndex];
			const clone = deepClone(settings[GuildSettings.Roles.Auto]);

			settings[GuildSettings.Roles.Auto] = clone.sort(SORT);
			return autoRole;
		});

		return message.send(args.t(LanguageKeys.Commands.Social.AutoRoleUpdate, { role, points, before: autoRole.points }));
	}

	public async show(message: GuildMessage) {
		const output = await message.guild.writeSettings((settings) => {
			const autoRoles = settings[GuildSettings.Roles.Auto];

			if (!autoRoles.length) this.error(LanguageKeys.Commands.Social.AutoRoleListEmpty);

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

			if (!output.length) this.error(LanguageKeys.Commands.Social.AutoRoleListEmpty);

			return output;
		});

		return message.send(output.join('\n'), { code: 'http' });
	}

	private async parseLevel(args: SkyraCommand.Args) {
		const result = await args.pickResult('integer', { minimum: 1, maximum: UserCommand.maximumPoints });

		// If the integer parse was successful, return it:
		if (result.success) return result.value;

		// If it was erroneous, but it was because it wasn't a valid integer, try parsing level:
		if (result.error.identifier === Identifiers.ArgumentInteger) return args.pick(UserCommand.level);

		// It was a valid integer, but the number was out of range:
		throw result.error;
	}

	private static readonly maximumPoints = 100_000_000;
	private static readonly level = Args.make<number>((parameter, { argument }) => {
		if (parameter.length === 1 || (!parameter.endsWith('l') && !parameter.endsWith('L'))) {
			return Args.error({ argument, parameter, identifier: LanguageKeys.Commands.Social.AutoRoleInvalidLevel });
		}

		const level = Number(parameter.slice(0, -1));
		if (Number.isNaN(level)) {
			return Args.error({ argument, parameter, identifier: LanguageKeys.Commands.Social.AutoRoleInvalidLevel });
		}

		// There cannot be a level below 0
		if (level <= 0) {
			return Args.error({ argument, parameter, identifier: LanguageKeys.Commands.Social.AutoRoleInvalidNegativeOrZeroLevel });
		}

		const points = Math.floor((level / 0.2) ** 2);
		if (points < 1) {
			return Args.error({
				argument,
				parameter,
				identifier: LanguageKeys.Commands.Social.AutoRoleTooLow,
				context: { minimum: 1, maximum: this.maximumPoints, points }
			});
		}

		if (points > this.maximumPoints) {
			return Args.error({
				argument,
				parameter,
				identifier: LanguageKeys.Commands.Social.AutoRoleTooHigh,
				context: { minimum: 1, maximum: this.maximumPoints, points }
			});
		}

		return Args.ok(points);
	});
}
