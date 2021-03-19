import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, UserPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { MessageEmbed, Role } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<PaginatedMessageCommand.Options>({
	aliases: ['pr', 'role', 'public-roles', 'public-role'],
	cooldown: 5,
	description: LanguageKeys.Commands.Management.RolesDescription,
	extendedHelp: LanguageKeys.Commands.Management.RolesExtended,
	permissions: ['MANAGE_ROLES', 'MANAGE_MESSAGES']
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async run(message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const [rolesPublic, allRoleSets, rolesRemoveInitial, rolesInitial] = await message.guild.readSettings([
			GuildSettings.Roles.Public,
			GuildSettings.Roles.UniqueRoleSets,
			GuildSettings.Roles.RemoveInitial,
			GuildSettings.Roles.Initial
		]);

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
		const { position } = message.guild.me!.roles.highest;

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

				for (const set of allRoleSets) {
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

		// If the guild requests to remove the initial role upon claiming, remove the initial role
		if (rolesInitial && rolesRemoveInitial && addedRoles.length) {
			// If the role was deleted, remove it from the settings
			if (!message.guild.roles.cache.has(rolesInitial)) {
				await message.guild.writeSettings([[GuildSettings.Roles.Initial, null]]).catch((error) => this.context.client.logger.fatal(error));
			} else if (message.member!.roles.cache.has(rolesInitial)) {
				memberRoles.delete(rolesInitial);
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
		return message.send(output.join('\n'));
	}

	private async list(message: GuildMessage, t: TFunction, publicRoles: readonly string[]) {
		const remove: string[] = [];
		const roles: string[] = [];
		for (const roleID of publicRoles) {
			const role = message.guild.roles.cache.get(roleID);
			if (role) roles.push(role.name);
			else remove.push(roleID);
		}

		// Automatic role deletion
		if (remove.length) {
			const allRoles = new Set(publicRoles);
			for (const role of remove) allRoles.delete(role);
			await message.guild.writeSettings([[GuildSettings.Roles.Public, [...allRoles]]]);
		}

		// There's the possibility all roles could be inexistent, therefore the system
		// would filter and remove them all, causing this to be empty.
		if (!roles.length) this.error(LanguageKeys.Commands.Management.RolesListEmpty);

		const user = this.context.client.user!;
		const display = new UserPaginatedMessage({
			template: new MessageEmbed()
				.setColor(await this.context.db.fetchColor(message))
				.setAuthor(user.username, user.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
				.setTitle(t(LanguageKeys.Commands.Management.RolesListTitle))
		});

		const pages = Math.ceil(roles.length / 10);
		for (let i = 0; i < pages; i++) display.addPageEmbed((template) => template.setDescription(roles.slice(i * 10, i * 10 + 10)));

		const response = await sendLoadingMessage(message, t);
		await display.start(response as GuildMessage, message.author);
		return response;
	}
}
