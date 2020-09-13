import { DbSet } from '@lib/structures/DbSet';
import { RichDisplayCommand, RichDisplayCommandOptions } from '@lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { Events } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';
import { FuzzySearch } from '@utils/FuzzySearch';
import { pickRandom } from '@utils/util';
import { MessageEmbed, Role } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<RichDisplayCommandOptions>({
	cooldown: 5,
	description: (language) => language.get('commandRolesDescription'),
	extendedHelp: (language) => language.get('commandRolesExtended'),
	requiredGuildPermissions: ['MANAGE_ROLES'],
	requiredPermissions: ['MANAGE_MESSAGES'],
	runIn: ['text'],
	usage: '(roles:rolenames)'
})
export default class extends RichDisplayCommand {
	public async init() {
		this.createCustomResolver('rolenames', async (arg, _, message) => {
			const rolesPublic = message.guild!.settings.get(GuildSettings.Roles.Public);
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
		});
	}

	public async run(message: KlasaMessage, [roles]: [Role[]]) {
		const rolesPublic = message.guild!.settings.get(GuildSettings.Roles.Public);

		if (!roles) throw message.language.get('commandRolesListEmpty');
		if (!roles.length) {
			const prefix = message.guild!.settings.get(GuildSettings.Prefix);
			if (message.args.some((v) => v.length !== 0)) throw message.language.get('commandRolesAbort', { prefix });
			return this.list(message, rolesPublic);
		}
		const memberRoles = new Set(message.member!.roles.cache.keys());
		// Remove the everyone role
		memberRoles.delete(message.guild!.id);

		const filterRoles = new Set(roles);
		const unlistedRoles: string[] = [];
		const unmanageable: string[] = [];
		const addedRoles: string[] = [];
		const removedRoles: string[] = [];
		const { position } = message.guild!.me!.roles.highest;

		const allRoleSets = message.guild!.settings.get(GuildSettings.Roles.UniqueRoleSets);

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
							const roleToRemove = message.guild!.roles.cache.get(id)!;
							removedRoles.push(roleToRemove.name);
						}
					}
				}
			}
		}

		const rolesRemoveInitial = message.guild!.settings.get(GuildSettings.Roles.RemoveInitial);
		const rolesInitial = message.guild!.settings.get(GuildSettings.Roles.Initial);

		// If the guild requests to remove the initial role upon claiming, remove the initial role
		if (rolesInitial && rolesRemoveInitial && addedRoles.length) {
			// If the role was deleted, remove it from the settings
			if (!message.guild!.roles.cache.has(rolesInitial))
				message.guild!.settings.reset(GuildSettings.Roles.Initial).catch((error) => this.client.emit(Events.Wtf, error));
			else if (message.member!.roles.cache.has(rolesInitial)) memberRoles.delete(rolesInitial);
		}

		// Apply the roles
		if (removedRoles.length || addedRoles.length) await message.member!.roles.set([...memberRoles], message.language.get('commandRolesAuditlog'));

		const output: string[] = [];
		if (unlistedRoles.length) output.push(message.language.get('commandRolesNotPublic', { roles: unlistedRoles.join('`, `') }));
		if (unmanageable.length) output.push(message.language.get('commandRolesNotManageable', { roles: unmanageable.join('`, `') }));
		if (removedRoles.length) output.push(message.language.get('commandRolesRemoved', { roles: removedRoles.join('`, `') }));
		if (addedRoles.length) output.push(message.language.get('commandRolesAdded', { roles: addedRoles.join('`, `') }));
		return message.sendMessage(output.join('\n'));
	}

	private async list(message: KlasaMessage, publicRoles: readonly string[]) {
		const remove: string[] = [];
		const roles: string[] = [];
		for (const roleID of publicRoles) {
			const role = message.guild!.roles.cache.get(roleID);
			if (role) roles.push(role.name);
			else remove.push(roleID);
		}

		// Automatic role deletion
		if (remove.length) {
			const allRoles = new Set(publicRoles);
			for (const role of remove) allRoles.delete(role);
			await message.guild!.settings.update(GuildSettings.Roles.Public, [...allRoles], { arrayAction: 'overwrite' });
		}

		// There's the possibility all roles could be inexistent, therefore the system
		// would filter and remove them all, causing this to be empty.
		if (!roles.length) throw message.language.get('commandRolesListEmpty');

		const display = new UserRichDisplay(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setAuthor(this.client.user!.username, this.client.user!.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
				.setTitle(message.language.get('commandRolesListTitle'))
		);

		const pages = Math.ceil(roles.length / 10);
		for (let i = 0; i < pages; i++) display.addPage((template: MessageEmbed) => template.setDescription(roles.slice(i * 10, i * 10 + 10)));

		const response = await message.sendEmbed(
			new MessageEmbed({ description: pickRandom(message.language.get('systemLoading')), color: BrandingColors.Secondary })
		);
		await display.start(response, message.author.id);
		return response;
	}
}
