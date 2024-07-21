import { GuildSettings, readSettings, writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, SkyraPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { getColor, sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import type { TFunction } from '@sapphire/plugin-i18next';
import { chunk } from '@sapphire/utilities';
import { EmbedBuilder, PermissionFlagsBits, type Role } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>(
	SkyraCommand.PaginatedOptions({
		aliases: ['pr', 'role', 'public-roles', 'public-role'],
		description: LanguageKeys.Commands.Management.RolesDescription,
		detailedDescription: LanguageKeys.Commands.Management.RolesExtended,
		requiredClientPermissions: [PermissionFlagsBits.ManageRoles, PermissionFlagsBits.ManageMessages],
		runIn: [CommandOptionsRunTypeEnum.GuildAny]
	})
)
export class UserPaginatedMessageCommand extends SkyraCommand {
	public override async messageRun(message: GuildMessage, args: SkyraCommand.Args) {
		const settings = await readSettings(message.guild);

		const { rolesPublic } = settings;
		if (!rolesPublic.length) this.error(LanguageKeys.Commands.Management.RolesListEmpty);

		// If no argument was provided then show the list of available roles
		if (args.finished) return this.list(message, args.t, rolesPublic);

		const roles = [...new Set(await args.repeat('roleName', { filter: (role: Role) => rolesPublic.includes(role.id) }))];

		// Otherwise start process of claiming a role
		const memberRoles = new Set(message.member!.roles.cache.keys());

		// Remove the everyone role
		memberRoles.delete(message.guild.id);

		const filterRoles = new Set(roles);
		const unlistedRoles: string[] = [];
		const unmanageable: string[] = [];
		const addedRoles: string[] = [];
		const removedRoles: string[] = [];
		const { position } = message.guild.members.me!.roles.highest;

		for (const role of filterRoles) {
			if (!role) continue;
			if (!rolesPublic.includes(role.id)) {
				unlistedRoles.push(role.name);
			} else if (position <= role.position) {
				unmanageable.push(role.name);
			} else if (memberRoles.has(role.id)) {
				memberRoles.delete(role.id);
				removedRoles.push(role.name);
			} else {
				memberRoles.add(role.id);
				addedRoles.push(role.name);

				for (const set of settings.rolesUniqueRoleSets) {
					// If the set does not have the role being added skip to next set
					if (!set.roles.includes(role.id)) continue;

					for (const id of set.roles) {
						// If this role is the role being added skip
						if (role.id === id) continue;

						if (memberRoles.has(id)) {
							// If the member has this role we need to delete it
							memberRoles.delete(id);
							// get to the role object so we can get the name of the role to show the user it was removed
							const roleToRemove = message.guild.roles.cache.get(id)!;
							removedRoles.push(roleToRemove.name);
						}
					}
				}
			}
		}

		const actualInitialRole = settings.rolesInitial ?? (message.author.bot ? settings.rolesInitialBots : settings.rolesInitialHumans);
		// If the guild requests to remove the initial role upon claiming, remove the initial role
		if (actualInitialRole && settings.rolesRemoveInitial && addedRoles.length) {
			// If the role was deleted, remove it from the settings
			if (!message.guild.roles.cache.has(actualInitialRole)) {
				await writeSettings(message.guild, [[GuildSettings.Roles.Initial, null]]).catch((error) => this.container.logger.fatal(error));
			} else if (message.member!.roles.cache.has(actualInitialRole)) {
				memberRoles.delete(actualInitialRole);
			}
		}

		const { t } = args;

		// Apply the roles
		if (removedRoles.length || addedRoles.length)
			await message.member!.roles.set([...memberRoles], t(LanguageKeys.Commands.Management.RolesAuditLog));

		const output: string[] = [];
		if (unlistedRoles.length) output.push(t(LanguageKeys.Commands.Management.RolesNotPublic, { roles: unlistedRoles.join('`, `') }));
		if (unmanageable.length) output.push(t(LanguageKeys.Commands.Management.RolesNotManageable, { roles: unmanageable.join('`, `') }));
		if (removedRoles.length) output.push(t(LanguageKeys.Commands.Management.RolesRemoved, { roles: removedRoles.join('`, `') }));
		if (addedRoles.length) output.push(t(LanguageKeys.Commands.Management.RolesAdded, { roles: addedRoles.join('`, `') }));

		const content = output.join('\n');
		return send(message, content);
	}

	private async list(message: GuildMessage, t: TFunction, publicRoles: readonly string[]) {
		const remove: string[] = [];
		const roles: string[] = [];
		for (const roleId of publicRoles) {
			const role = message.guild.roles.cache.get(roleId);
			if (role) roles.push(role.name);
			else remove.push(roleId);
		}

		// Automatic role deletion
		if (remove.length) {
			const allRoles = new Set(publicRoles);
			for (const role of remove) allRoles.delete(role);
			await writeSettings(message.guild, [[GuildSettings.Roles.Public, [...allRoles]]]);
		}

		// There's the possibility all roles could be inexistent, therefore the system
		// would filter and remove them all, causing this to be empty.
		if (!roles.length) this.error(LanguageKeys.Commands.Management.RolesListEmpty);

		const display = new SkyraPaginatedMessage({
			template: new EmbedBuilder() //
				.setColor(getColor(message))
				.setTitle(t(LanguageKeys.Commands.Management.RolesListTitle))
		});

		for (const page of chunk(roles, 10)) {
			display.addPageEmbed((embed) => embed.setDescription(page.join('\n')));
		}

		const response = await sendLoadingMessage(message, t);
		await display.run(response, message.author);
		return response;
	}
}
