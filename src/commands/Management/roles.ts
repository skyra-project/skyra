import { DbSet, GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, UserPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { FuzzySearch } from '#utils/Parsers/FuzzySearch';
import { sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { CreateResolvers } from '@skyra/decorators';
import { MessageEmbed, Role } from 'discord.js';

@ApplyOptions<PaginatedMessageCommand.Options>({
	aliases: ['pr', 'role', 'public-roles', 'public-role'],
	cooldown: 5,
	description: LanguageKeys.Commands.Management.RolesDescription,
	extendedHelp: LanguageKeys.Commands.Management.RolesExtended,
	permissions: ['MANAGE_ROLES', 'MANAGE_MESSAGES'],
	usage: '(roles:rolenames)'
})
@CreateResolvers([
	[
		'rolenames',
		async (arg, _, message) => {
			const rolesPublic = await message.guild!.readSettings(GuildSettings.Roles.Public);
			if (!rolesPublic.length) return null;
			if (!arg) return [];

			const search = new FuzzySearch(
				message.guild!.roles.cache,
				(role) => role.name,
				(role) => rolesPublic.includes(role.id)
			);
			const roles = arg
				.split(',')
				.map((role) => role.trim())
				.filter((role) => role.length);
			const output: Role[] = [];
			for (const role of roles) {
				const result = await search.run(message, role);
				if (result) output.push(result[1]);
			}
			return output.length ? [...new Set(output)] : output;
		}
	]
])
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async run(message: GuildMessage, [roles]: [Role[]]) {
		const [rolesPublic, prefix, allRoleSets, rolesRemoveInitial, rolesInitial, t] = await message.guild.readSettings((settings) => [
			settings[GuildSettings.Roles.Public],
			settings[GuildSettings.Prefix],
			settings[GuildSettings.Roles.UniqueRoleSets],
			settings[GuildSettings.Roles.RemoveInitial],
			settings[GuildSettings.Roles.Initial],
			settings.getLanguage()
		]);

		if (!roles) throw t(LanguageKeys.Commands.Management.RolesListEmpty);
		if (!roles.length) {
			if (message.args.some((v) => v.length !== 0)) throw t(LanguageKeys.Commands.Management.RolesAbort, { prefix });
			return this.list(message, rolesPublic);
		}
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

	private async list(message: GuildMessage, publicRoles: readonly string[]) {
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

		const t = await message.fetchT();

		// There's the possibility all roles could be inexistent, therefore the system
		// would filter and remove them all, causing this to be empty.
		if (!roles.length) throw t(LanguageKeys.Commands.Management.RolesListEmpty);

		const user = this.context.client.user!;
		const display = new UserPaginatedMessage({
			template: new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
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
