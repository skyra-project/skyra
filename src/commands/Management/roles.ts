import { MessageEmbed, Role } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { UserRichDisplay } from '../../lib/structures/UserRichDisplay';
import { Events } from '../../lib/types/Enums';
import { GuildSettings } from '../../lib/types/settings/GuildSettings';
import { FuzzySearch } from '../../lib/util/FuzzySearch';
import { getColor } from '../../lib/util/util';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 5,
			description: language => language.get('COMMAND_ROLES_DESCRIPTION'),
			extendedHelp: language => language.get('COMMAND_ROLES_EXTENDED'),
			requiredPermissions: ['MANAGE_MESSAGES'],
			requiredGuildPermissions: ['MANAGE_ROLES'],
			runIn: ['text'],
			usage: '(roles:rolenames)'
		});

		this.createCustomResolver('rolenames', async (arg, _, message) => {
			const rolesPublic = message.guild!.settings.get(GuildSettings.Roles.Public) as GuildSettings.Roles.Public;
			if (!rolesPublic.length) return null;
			if (!arg) return [];

			const search = new FuzzySearch(message.guild!.roles, role => role.name, role => rolesPublic.includes(role.id));
			const roles = arg.split(',').map(role => role.trim()).filter(role => role.length);
			const output: Role[] = [];
			for (const role of roles) {
				const result = await search.run(message, role);
				if (result) output.push(result[1]);
			}
			return output.length ? [...new Set(output)] : output;
		});
	}

	public async run(message: KlasaMessage, [roles]: [Role[]]) {
		const rolesPublic = message.guild!.settings.get(GuildSettings.Roles.Public) as GuildSettings.Roles.Public;

		if (!roles) throw message.language.get('COMMAND_ROLES_LIST_EMPTY');
		if (!roles.length) {
			const prefix = message.guild!.settings.get(GuildSettings.Prefix) as GuildSettings.Prefix;
			if (message.args.some(v => v.length !== 0)) throw message.language.get('COMMAND_ROLES_ABORT', prefix);
			return this.list(message, rolesPublic);
		}
		const memberRoles = new Set(message.member!.roles.keys());
		// Remove the everyone role
		memberRoles.delete(message.guild!.id);

		const filterRoles = new Set(roles);
		const unlistedRoles: string[] = [];
		const unmanageable: string[] = [];
		const addedRoles: string[] = [];
		const removedRoles: string[] = [];
		const { position } = message.guild!.me!.roles.highest;

		const allRoleSets = message.guild!.settings.get(GuildSettings.Roles.UniqueRoleSets) as GuildSettings.Roles.UniqueRoleSets;

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
							const roleToRemove = message.guild!.roles.get(id)!;
							removedRoles.push(roleToRemove.name);
						}
					}
				}
			}
		}

		const rolesRemoveInitial = message.guild!.settings.get(GuildSettings.Roles.RemoveInitial) as GuildSettings.Roles.RemoveInitial;
		const rolesInitial = message.guild!.settings.get(GuildSettings.Roles.Initial) as GuildSettings.Roles.Initial;

		// If the guild requests to remove the initial role upon claiming, remove the initial role
		if (rolesInitial && rolesRemoveInitial && addedRoles.length) {
			// If the role was deleted, remove it from the settings
			if (!message.guild!.roles.has(rolesInitial)) message.guild!.settings.reset(GuildSettings.Roles.Initial).catch(error => this.client.emit(Events.Wtf, error));
			else if (message.member!.roles.has(rolesInitial)) memberRoles.delete(rolesInitial);
		}

		// Apply the roles
		if (removedRoles.length || addedRoles.length) await message.member!.roles.set([...memberRoles], message.language.get('COMMAND_ROLES_AUDITLOG'));

		const output = [];
		if (unlistedRoles.length) output.push(message.language.get('COMMAND_ROLES_NOT_PUBLIC', unlistedRoles.join('`, `')));
		if (unmanageable.length) output.push(message.language.get('COMMAND_ROLES_NOT_MANAGEABLE', unmanageable.join('`, `')));
		if (removedRoles.length) output.push(message.language.get('COMMAND_ROLES_REMOVED', removedRoles.join('`, `')));
		if (addedRoles.length) output.push(message.language.get('COMMAND_ROLES_ADDED', addedRoles.join('`, `')));
		return message.sendMessage(output.join('\n'));
	}

	public async list(message: KlasaMessage, publicRoles: string[]) {
		const remove: string[] = [];
		const roles: string[] = [];
		for (const roleID of publicRoles) {
			const role = message.guild!.roles.get(roleID);
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
		if (!roles.length) throw message.language.get('COMMAND_ROLES_LIST_EMPTY');

		const display = new UserRichDisplay(new MessageEmbed()
			.setColor(getColor(message) || 0xFFAB2D)
			.setAuthor(this.client.user!.username, this.client.user!.displayAvatarURL())
			.setTitle(message.language.get('COMMAND_ROLES_LIST_TITLE')));

		const pages = Math.ceil(roles.length / 10);
		for (let i = 0; i < pages; i++) display.addPage(template => template.setDescription(roles.slice(i * 10, (i * 10) + 10)));

		const response = await message.sendEmbed(new MessageEmbed({ description: message.language.get('SYSTEM_LOADING'), color: getColor(message) || 0xFFAB2D })) as KlasaMessage;
		await display.run(response, message.author!.id);
		return response;
	}

}
